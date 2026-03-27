'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/types';
import type { BookingSelections, PaymentDetails } from '@/lib/validation/booking';
import { 
  createPendingBookingAction, 
  initiateMvolaPaymentAction 
} from '@/lib/actions/bookings';
import { formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Step4Props {
  service: Service;
  selections: BookingSelections;
  onUpdate: (payment: Partial<PaymentDetails>) => void;
  onSuccess: (bookingId: string) => void;
  onBack: () => void;
}

export function Step4Payment({ service, selections, onUpdate, onSuccess, onBack }: Step4Props) {
  const [phase, setPhase] = useState<'input' | 'waiting' | 'error'>('input');
  const [clientMsisdn, setClientMsisdn] = useState(selections.client.clientPhone || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const depositMga = Math.ceil(service.price_mga * (service.deposit_percent / 100));
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startPolling = (bookingId: string) => {
    let elapsed = 0;
    const intervalMs = 3000;
    const maxWaitMs = 600000; // 10 minutes

    intervalRef.current = setInterval(async () => {
      elapsed += intervalMs;
      if (elapsed > maxWaitMs) {
        clearInterval(intervalRef.current);
        // We don't know the final state yet; assume payment is still pending and
        // prevent the user from going back to modify the booking.
        setBookingStatus('pending_payment');
        setErrorMessage('Délai d\'attente dépassé. Si vous avez effectué le paiement, contactez-nous.');
        setPhase('error');
        return;
      }

      try {
        const res = await fetch(`/api/bookings/${bookingId}/status`);
        if (!res.ok) return;

        const data = await res.json();
        setBookingStatus(data.status);
        
        if (data.status === 'confirmed' || data.status === 'completed') {
          clearInterval(intervalRef.current);
          onSuccess(data.bookingId); // Use full UUID for the confirmation page redirect
        } else if (data.status === 'cancelled' || data.status === 'no_show') {
          clearInterval(intervalRef.current);
          setErrorMessage('La réservation a expiré ou a été annulée. Veuillez recommencer.');
          setPhase('error');
        } else {
          // pending_payment -> keep waiting
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, intervalMs);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientMsisdn(e.target.value.replace(/\s/g, ''));
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Ensure the phone number is always sent without spaces.
    // This covers both freshly typed input and any pre-filled value coming from selections.
    const cleanMsisdn = clientMsisdn.replace(/\s/g, '').trim();

    // Make sure we have a valid 10-digit number
    if (!/^0[23]\d{8}$/.test(cleanMsisdn)) {
      setErrorMessage('Numéro invalide. Ex: 0341234567');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create pending booking if we haven't already
      let currentBookingId = activeBookingId;
      
      if (!currentBookingId) {
        // Prepare selection for Mvola generic, with a unique reference to avoid replay attack checks
        const tempRef = `PENDING-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const finalSelections: BookingSelections = {
          ...selections,
          payment: {
            paymentMethod: 'mvola',
            paymentRef: tempRef
          }
        };

        const resPending = await createPendingBookingAction(finalSelections);
        if (!resPending.success) {
          setErrorMessage(resPending.error || 'Erreur lors de la création de la réservation.');
          setIsSubmitting(false);
          return;
        }
        currentBookingId = resPending.bookingId;
        setActiveBookingId(currentBookingId);
        setBookingStatus('pending_payment');
        
        // Save back locally
        onUpdate({
          paymentMethod: 'mvola',
          paymentRef: tempRef
        });
      }

      // 2. Initiate Mvola payment
      const mvolaRes = await initiateMvolaPaymentAction(currentBookingId, cleanMsisdn);
      
      if (!mvolaRes.success) {
        setErrorMessage(mvolaRes.error);
        setIsSubmitting(false);
        return;
      }

      // 3. Move to waiting and start polling
      setPhase('waiting');
      startPolling(currentBookingId);

    } catch (err) {
      console.error(err);
      setErrorMessage('Une erreur réseau est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const handleCancelAndBack = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (activeBookingId) {
      // Edge case / Option A:
      // Once a booking is created in DB and we're still pending, we must not allow
      // the user to go back to steps 1-3 and modify the booking.
      // Instead, keep them in the payment waiting flow for the same booking.
      if (bookingStatus === 'pending_payment' || bookingStatus === null) {
        setPhase('waiting');
        setErrorMessage(null);
        startPolling(activeBookingId);
        return;
      }

      // If DB already marked the booking cancelled/no_show, allow navigation back.
      setActiveBookingId(null);
      setBookingStatus(null);
      onBack();
      return;
    }

    onBack();
  };

  const handleRetry = () => {
    if (activeBookingId && (bookingStatus === 'pending_payment' || bookingStatus === null)) {
      // Still pending: do not let the user go back and create/modify bookings.
      setPhase('waiting');
      setErrorMessage(null);
      startPolling(activeBookingId);
      return;
    }

    // Booking is no longer pending -> allow a fresh payment flow.
    setActiveBookingId(null);
    setBookingStatus(null);
    setErrorMessage(null);
    setPhase('input');
  };

  const formattedDate = selections.dateTime.date
    ? formatInTimeZone(selections.dateTime.date, 'Africa/Nairobi', 'EEEE d MMMM yyyy', { locale: fr })
    : '';

  const TIMEZONE = 'Africa/Nairobi';
  const startTime = selections.dateTime.slotStart 
    ? formatInTimeZone(new Date(selections.dateTime.slotStart), TIMEZONE, 'HH:mm')
    : '';
  const endTime = selections.dateTime.slotEnd
    ? formatInTimeZone(new Date(selections.dateTime.slotEnd), TIMEZONE, 'HH:mm')
    : '';

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-blossome-brown mb-1">
        Paiement
      </h2>
      <p className="text-sm text-blossome-mid mb-6">
        Procédez au paiement via Mvola pour confirmer votre réservation.
      </p>

      {/* ── Booking Summary ─────────────────────────────────── */}
      <div className="rounded-xl bg-blossome-cream p-5 mb-8 border border-blossome-taupe/20 hidden sm:block">
        <h3 className="font-medium text-blossome-brown mb-4 border-b border-blossome-taupe/30 pb-2">
          Récapitulatif
        </h3>
        <ul className="space-y-2 text-sm text-blossome-mid">
          <li className="flex justify-between">
            <span>Service :</span>
            <span className="font-medium text-blossome-brown text-right">{service.name}</span>
          </li>
          <li className="flex justify-between">
            <span>Date :</span>
            <span className="font-medium text-blossome-brown text-right">{formattedDate}</span>
          </li>
          <li className="flex justify-between">
            <span>Heure :</span>
            <span className="font-medium text-blossome-brown text-right">{startTime} - {endTime}</span>
          </li>
          <li className="flex justify-between">
            <span>Praticien(ne) :</span>
            <span className="font-medium text-blossome-brown text-right">
              {selections.dateTime.staffId ? 'Praticien sélectionné' : "Toute l'équipe"}
            </span>
          </li>
          <li className="flex justify-between pt-2 border-t border-blossome-taupe/20 mt-2">
            <span>Total :</span>
            <span className="font-bold text-blossome-brown">
              {service.price_mga.toLocaleString('fr-FR')} Ar
            </span>
          </li>
          <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-blossome-gold/30 mt-3 shadow-sm">
            <span className="font-bold text-blossome-gold">Dépôt à payer ({service.deposit_percent}%) :</span>
            <span className="font-extrabold text-blossome-gold text-base">
              {depositMga.toLocaleString('fr-FR')} Ar
            </span>
          </li>
        </ul>
      </div>

      {phase === 'input' && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="clientMsisdn" className="text-blossome-brown font-medium">
              Numéro Mvola du client <span className="text-blossome-gold">*</span>
            </Label>
            <Input
              id="clientMsisdn"
              type="tel"
              inputMode="numeric"
              placeholder="034 XX XXX XX"
              value={clientMsisdn}
              onChange={handlePhoneChange}
              className="h-11 font-mono text-lg tracking-wider border-blossome-taupe/30 focus-visible:border-blossome-gold focus-visible:ring-blossome-gold/20"
            />
            <p className="text-xs text-blossome-mid/70 mt-1">
              Le montant de {depositMga.toLocaleString('fr-FR')} Ar sera débité de ce numéro.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between border-t border-blossome-taupe/20 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAndBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto border-blossome-taupe text-blossome-mid hover:bg-blossome-cream disabled:opacity-40"
            >
              Précédent
            </Button>

            <Button
              type="button"
              onClick={handleConfirmAndPay}
              disabled={isSubmitting || clientMsisdn.length < 10}
              className="w-full sm:w-auto bg-blossome-gold text-white hover:bg-blossome-gold/90 px-8 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                'Confirmer le paiement'
              )}
            </Button>
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 rounded-full border-4 border-blossome-cream border-t-blossome-gold mb-2"
          />
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-semibold text-blossome-brown">Demande envoyée !</h3>
            <p className="text-blossome-mid">
              Une demande de paiement de <strong className="text-blossome-brown">{depositMga.toLocaleString('fr-FR')} Ar</strong> a été envoyée au <strong className="text-blossome-brown font-mono">{clientMsisdn}</strong>.
            </p>
            <p className="text-blossome-mid font-medium mt-4 p-4 bg-blossome-gold-lt/10 rounded-lg text-sm">
              Veuillez approuver le paiement sur votre téléphone Mvola.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelAndBack}
            className="mt-8 border-blossome-taupe text-blossome-mid"
          >
            Annuler
          </Button>
        </div>
      )}

      {phase === 'error' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display font-semibold text-blossome-brown">Erreur de paiement</h3>
            <p className="text-blossome-mid max-w-sm mx-auto">{errorMessage}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelAndBack}
              className="border-blossome-taupe text-blossome-mid"
            >
              Retour
            </Button>
            <Button
              onClick={handleRetry}
              className="bg-blossome-gold text-white hover:bg-blossome-gold/90"
            >
              Réessayer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
