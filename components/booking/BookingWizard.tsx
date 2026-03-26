'use client';

import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/types';
import type { BookingSelections, DateTimeSelection, ClientDetails } from '@/lib/validation/booking';
import { initialBookingSelections } from '@/lib/validation/booking';
import { serviceSelectionSchema, dateTimeSchema, clientDetailsSchema } from '@/lib/validation/booking';
import { Step1ServiceSelection } from './Step1ServiceSelection';
import { Step2DateTime } from './Step2DateTime';
import { Step3ClientDetails } from './Step3ClientDetails';
import { Step4Payment } from './Step4Payment';
import { useRouter } from 'next/navigation';

/* ── Step config ─────────────────────────────────────────── */
const STEP_LABELS = [
  'Service',
  'Date & Heure',
  'Coordonnées',
  'Paiement',
  'Confirmation',
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

interface BookingWizardProps {
  initialService: Service | null;
}

export function BookingWizard({ initialService }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<BookingSelections>(() => {
    const base = { ...initialBookingSelections };
    if (initialService) {
      base.service = { serviceId: initialService.id };
    }
    return base;
  });
  const [selectedService, setSelectedService] = useState<Service | null>(initialService);
  const [validationError, setValidationError] = useState<string | null>(null);

  /* ── Update helpers ──────────────────────────────────────── */
  const updateSelections = useCallback(
    <K extends keyof BookingSelections>(
      key: K,
      value: BookingSelections[K]
    ) => {
      setSelections((prev) => ({ ...prev, [key]: value }));
      setValidationError(null);
    },
    []
  );

  /* ── Step-level validation ───────────────────────────────── */
  const validateCurrentStep = useCallback((): boolean => {
    switch (step) {
      case 1: {
        const result = serviceSelectionSchema.safeParse(selections.service);
        if (!result.success) {
          setValidationError('Veuillez sélectionner un service');
          return false;
        }
        return true;
      }
      case 2: {
        const result = dateTimeSchema.safeParse(selections.dateTime);
        if (!result.success) {
          setValidationError('Veuillez sélectionner une date et un créneau horaire');
          return false;
        }
        return true;
      }
      case 3: {
        const result = clientDetailsSchema.safeParse(selections.client);
        if (!result.success) {
          setValidationError('Veuillez remplir correctement vos coordonnées');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }, [step, selections]);

  /* ── Navigation ──────────────────────────────────────────── */
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setValidationError(null);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  }, [validateCurrentStep]);

  const handlePrev = useCallback(() => {
    setValidationError(null);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleStep1Update = useCallback((service: Service) => {
    setSelectedService(service);
    updateSelections('service', { serviceId: service.id });
  }, [updateSelections]);

  const handleStep2Update = useCallback((dateTime: Partial<DateTimeSelection>) => {
    updateSelections('dateTime', dateTime);
  }, [updateSelections]);

  const handleStep3Update = useCallback((client: Partial<ClientDetails>) => {
    updateSelections('client', client);
  }, [updateSelections]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Progress bar ──────────────────────────────────────── */}
      <nav aria-label="Étapes de réservation" className="mb-10">
        <ol className="flex items-center justify-between">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;

            return (
              <li
                key={label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                {/* Step circle + connector */}
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        isCompleted ? 'bg-blossome-gold' : 'bg-blossome-taupe/40'
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blossome-gold text-white'
                        : isActive
                          ? 'bg-blossome-gold text-white ring-4 ring-blossome-gold/20'
                          : 'bg-blossome-taupe/30 text-blossome-mid'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        isCompleted ? 'bg-blossome-gold' : 'bg-blossome-taupe/40'
                      }`}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-[11px] text-center leading-tight transition-colors duration-300 ${
                    isActive || isCompleted
                      ? 'text-blossome-brown font-medium'
                      : 'text-blossome-mid/60'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── Step content ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-blossome-taupe/20 shadow-sm p-6 md:p-8">
        {step === 1 && (
          <Step1ServiceSelection
            initialService={initialService}
            selectedService={selectedService}
            selections={selections}
            onServiceSelect={handleStep1Update}
          />
        )}

        {step === 2 && selectedService && (
          <Step2DateTime
            service={selectedService}
            selections={selections}
            onUpdate={handleStep2Update}
          />
        )}

        {step === 3 && (
          <Step3ClientDetails
            selections={selections}
            onUpdate={handleStep3Update}
          />
        )}

        {step === 4 && selectedService && (
          <Step4Payment
            service={selectedService}
            selections={selections}
            onUpdate={(payment) => updateSelections('payment', payment)}
            onSuccess={(bookingRef) => {
              setStep(5);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              router.push(`/booking/confirm?id=${bookingRef}` as any);
            }}
            onBack={handlePrev}
          />
        )}

        {step === 5 && (
          <div className="text-center py-12 text-blossome-mid">
            <p className="text-lg font-medium">Redirection en cours...</p>
            <p className="text-sm mt-2">Veuillez patienter.</p>
          </div>
        )}

        {/* ── Validation error ─────────────────────────────────── */}
        {validationError && (
          <p
            role="alert"
            className="mt-4 text-sm text-blossome-mid font-medium text-center bg-red-50 rounded-lg py-2 px-4"
          >
            {validationError}
          </p>
        )}

        {/* ── Navigation buttons ───────────────────────────────── */}
        {step < 4 && (
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1 ? true : undefined}
              suppressHydrationWarning
              className="border-blossome-taupe text-blossome-mid hover:bg-blossome-cream disabled:opacity-40"
            >
              Précédent
            </Button>

            {step < TOTAL_STEPS && (
              <Button
                onClick={handleNext}
                className="bg-blossome-gold text-white hover:bg-blossome-gold/90 px-8"
              >
                Suivant
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
