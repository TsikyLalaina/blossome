'use client';

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Mail, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BookingSelections, ClientDetails } from '@/lib/validation/booking';
import { clientDetailsSchema } from '@/lib/validation/booking';
import { formatMalagasyPhone } from '@/lib/utils/phone';

interface Step3Props {
  selections: BookingSelections;
  onUpdate: (client: Partial<ClientDetails>) => void;
}

export function Step3ClientDetails({ selections, onUpdate }: Step3Props) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ClientDetails>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: {
      clientName: (selections.client.clientName as string) ?? '',
      clientPhone: (selections.client.clientPhone as string) ?? '',
      clientEmail: (selections.client.clientEmail as string) ?? '',
      notes: (selections.client.notes as string) ?? '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();
  const notesLength = watchedValues.notes?.length ?? 0;

  /* ── Sync form values to parent ─────────────────────────── */
  useEffect(() => {
    const subscription = watch((value) => {
      onUpdate({
        clientName: value.clientName ?? '',
        clientPhone: value.clientPhone ?? '',
        clientEmail: value.clientEmail || undefined,
        notes: value.notes || undefined,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  /* ── Phone auto-format handler ──────────────────────────── */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMalagasyPhone(e.target.value);
    setValue('clientPhone', formatted, { shouldValidate: true });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-blossome-brown mb-1">
        Vos coordonnées
      </h2>
      <p className="text-sm text-blossome-mid mb-6">
        Remplissez vos informations pour confirmer la réservation
      </p>

      <div className="space-y-5">
        {/* ── Full name ───────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label
            htmlFor="clientName"
            className="text-blossome-brown font-medium"
          >
            <User className="inline h-4 w-4 mr-1.5 text-blossome-gold" />
            Votre nom complet <span className="text-blossome-gold">*</span>
          </Label>
          <Input
            id="clientName"
            type="text"
            placeholder="Ex : Ranaivo Harisoa"
            autoComplete="name"
            aria-invalid={!!errors.clientName}
            className="h-11 border-blossome-taupe/30 focus-visible:border-blossome-gold focus-visible:ring-blossome-gold/20"
            {...register('clientName')}
          />
          {errors.clientName && (
            <p className="text-sm text-blossome-mid font-medium" role="alert">
              {errors.clientName.message}
            </p>
          )}
        </div>

        {/* ── Phone ───────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label
            htmlFor="clientPhone"
            className="text-blossome-brown font-medium"
          >
            <Phone className="inline h-4 w-4 mr-1.5 text-blossome-gold" />
            Numéro de téléphone <span className="text-blossome-gold">*</span>
          </Label>
          <Input
            id="clientPhone"
            type="tel"
            inputMode="numeric"
            placeholder="034 XX XXX XX"
            autoComplete="tel"
            aria-invalid={!!errors.clientPhone}
            className="h-11 border-blossome-taupe/30 focus-visible:border-blossome-gold focus-visible:ring-blossome-gold/20"
            {...register('clientPhone', {
              onChange: handlePhoneChange,
            })}
          />
          {errors.clientPhone && (
            <p className="text-sm text-blossome-mid font-medium" role="alert">
              {errors.clientPhone.message}
            </p>
          )}
        </div>

        {/* ── Email (optional) ────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label
            htmlFor="clientEmail"
            className="text-blossome-brown font-medium"
          >
            <Mail className="inline h-4 w-4 mr-1.5 text-blossome-gold" />
            Email{' '}
            <span className="text-blossome-mid/60 text-xs font-normal">
              (optionnel)
            </span>
          </Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="votre@email.com"
            autoComplete="email"
            aria-invalid={!!errors.clientEmail}
            className="h-11 border-blossome-taupe/30 focus-visible:border-blossome-gold focus-visible:ring-blossome-gold/20"
            {...register('clientEmail')}
          />
          {errors.clientEmail && (
            <p className="text-sm text-blossome-mid font-medium" role="alert">
              {errors.clientEmail.message}
            </p>
          )}
        </div>

        {/* ── Notes / Allergies (optional) ─────────────────────── */}
        <div className="space-y-1.5">
          <Label
            htmlFor="notes"
            className="text-blossome-brown font-medium"
          >
            <FileText className="inline h-4 w-4 mr-1.5 text-blossome-gold" />
            Notes / Allergies{' '}
            <span className="text-blossome-mid/60 text-xs font-normal">
              (optionnel)
            </span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Informations complémentaires, allergies connues…"
            maxLength={300}
            rows={3}
            aria-invalid={!!errors.notes}
            className="border-blossome-taupe/30 focus-visible:border-blossome-gold focus-visible:ring-blossome-gold/20"
            {...register('notes')}
          />
          <div className="flex items-center justify-between">
            {errors.notes ? (
              <p className="text-sm text-blossome-mid font-medium" role="alert">
                {errors.notes.message}
              </p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs tabular-nums ${
                notesLength > 280
                  ? 'text-blossome-mid font-medium'
                  : 'text-blossome-mid/60'
              }`}
            >
              {notesLength}/300
            </span>
          </div>
        </div>

        {/* ── Auth link (future) ───────────────────────────────── */}
        <div className="rounded-lg bg-blossome-cream/50 border border-blossome-taupe/10 p-4">
          <p className="text-sm text-blossome-mid">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              className="text-blossome-gold font-medium hover:underline transition-colors"
              onClick={() => {
                // TODO: future auth hook
              }}
            >
              Connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
