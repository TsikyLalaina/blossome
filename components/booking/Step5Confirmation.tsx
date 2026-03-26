'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarRange, Share2, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Service, Booking } from '@/lib/types';
import { formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';

interface Step5Props {
  bookingId?: string; // Standard short booking REF (BLS-[8CHARS])
  booking?: Booking; // If passed from the server in /booking/confirm?id=
  service?: Service; 
}

const TIMEZONE = 'Africa/Nairobi';

export function Step5Confirmation({ bookingId = 'NON-RECONNU', booking, service }: Step5Props) {
  const shortRef = bookingId.slice(0, 8).toUpperCase();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const title = `RDV Blossome: ${service?.name || 'Soin'}`;
  const location = '12 Rue de l\'Institut, Ankadivato Antananarivo';
  
  // Format for Google Calendar (YYYYMMDDTHHmmssZ)
  const gcalHref = booking 
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatInTimeZone(booking.slot_start, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}/${formatInTimeZone(booking.slot_end, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}&details=${encodeURIComponent('Votre RDV chez Blossome Institut de Beauté')}&location=${encodeURIComponent(location)}`
    : '#';

  const waText = encodeURIComponent(`Bonjour ! J'ai bien réservé mon soin "${service?.name}" pour le ${booking ? formatInTimeZone(booking.slot_start, TIMEZONE, 'dd/MM/yyyy', { locale: fr }) : ''}. Ma référence est BLS-${shortRef}. À très vite !`);
  const waHref = `https://wa.me/?text=${waText}`;

  if (!mounted) return null; // Avoid hydration mismatch on formatting

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center max-w-md mx-auto">
      {/* ── Success Animation ─────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="mb-8"
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blossome-gold-lt/30">
          <CheckCircle2 className="h-16 w-16 text-blossome-gold" />
        </div>
      </motion.div>

      <h2 className="font-display text-3xl font-bold text-blossome-brown mb-2">
        Rendez-vous confirmé !
      </h2>
      <p className="text-blossome-mid mb-8">
        Merci pour votre réservation. Un email de confirmation contenant tous les détails vous a été envoyé.
      </p>

      {/* ── Booking Reference ─────────────────────────────────── */}
      <div className="w-full rounded-2xl bg-blossome-cream p-6 border border-blossome-taupe/30 mb-8 space-y-4">
        <div>
          <p className="text-sm font-medium text-blossome-mid mb-1">Votre référence client</p>
          <p className="font-mono text-xl md:text-2xl font-bold text-blossome-gold tracking-widest bg-white py-3 rounded-lg border border-blossome-gold/20">
            BLS-{shortRef}
          </p>
        </div>

        {booking && service && (
          <div className="pt-4 border-t border-blossome-taupe/30 text-left space-y-3">
            <h3 className="font-semibold text-blossome-brown">Récapitulatif</h3>
            <div>
              <p className="text-sm text-blossome-mid">Soin</p>
              <p className="font-medium text-blossome-brown">{service.name}</p>
            </div>
            <div>
              <p className="text-sm text-blossome-mid">Date et Heure</p>
              <p className="font-medium text-blossome-brown">
                {formatInTimeZone(booking.slot_start, TIMEZONE, 'EEEE d MMMM yyyy', { locale: fr })} de {formatInTimeZone(booking.slot_start, TIMEZONE, 'HH:mm')} à {formatInTimeZone(booking.slot_end, TIMEZONE, 'HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-blossome-mid">Lieu</p>
              <a 
                href="https://maps.google.com/?q=Ankadivato+Antananarivo" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-blossome-gold hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Voir sur la carte
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        {booking && (
          <a href={gcalHref} target="_blank" rel="noreferrer" className="w-full">
            <Button className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white gap-2">
              <CalendarRange className="h-4 w-4" />
              Ajouter à Google Calendar
            </Button>
          </a>
        )}
        
        <a href={waHref} target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2">
            <Share2 className="h-4 w-4" />
            Partager sur WhatsApp
          </Button>
        </a>

        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full mt-2 border-blossome-taupe text-blossome-brown hover:bg-blossome-cream">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
