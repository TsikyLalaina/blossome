'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service, ServiceCategory } from '@/lib/types';
import type { BookingSelections } from '@/lib/validation/booking';
import { getServicesAction } from '@/lib/actions/services';

/* ── Category config ─────────────────────────────────────── */
const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'coiffure', label: 'Coiffure' },
  { value: 'esthetique', label: 'Esthétique' },
  { value: 'onglerie', label: 'Onglerie' },
  { value: 'maquillage', label: 'Maquillage' },
];

function formatPrice(mga: number): string {
  return mga.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

interface Step1Props {
  initialService: Service | null;
  selectedService: Service | null;
  selections: BookingSelections;
  onServiceSelect: (service: Service) => void;
}

export function Step1ServiceSelection({
  initialService,
  selectedService,
  onServiceSelect,
}: Step1Props) {
  const [showSelector, setShowSelector] = useState(!initialService);
  const [allServices, setAllServices] = useState<Service[] | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Load all services when selector is opened ──────────── */
  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      if (!showSelector || allServices) return;
      setLoading(true);
      try {
        const data = await getServicesAction();
        if (mounted) setAllServices(data);
      } catch {
        if (mounted) setAllServices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchServices();

    return () => {
      mounted = false;
    };
  }, [showSelector, allServices]);

  /* ── Group services by category ─────────────────────────── */
  const servicesByCategory = allServices
    ? CATEGORIES.reduce(
        (acc, cat) => {
          acc[cat.value] = allServices.filter((s) => s.category === cat.value);
          return acc;
        },
        {} as Record<ServiceCategory, Service[]>
      )
    : null;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-blossome-brown mb-1">
        Choisissez votre service
      </h2>
      <p className="text-sm text-blossome-mid mb-6">
        Sélectionnez le soin que vous souhaitez réserver
      </p>

      {/* ── Pre-selected service card ─────────────────────────── */}
      {selectedService && !showSelector && (
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-blossome-gold bg-blossome-gold-lt/30 p-5 transition-all">
            {/* Checkmark */}
            <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-blossome-gold text-white">
              <Check className="h-3.5 w-3.5" />
            </div>

            <h3 className="font-display text-lg font-semibold text-blossome-brown pr-8">
              {selectedService.name}
            </h3>
            {selectedService.description && (
              <p className="text-sm text-blossome-mid mt-1 line-clamp-2">
                {selectedService.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-blossome-mid">
                <Clock className="h-3.5 w-3.5" />
                {selectedService.duration_minutes} min
              </span>
              <span className="font-bold text-blossome-gold">
                {formatPrice(selectedService.price_mga)} MGA
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSelector(true)}
            className="inline-flex items-center gap-1.5 text-sm text-blossome-gold hover:text-blossome-brown transition-colors font-medium"
          >
            <ChevronDown className="h-4 w-4" />
            Changer de service
          </button>
        </div>
      )}

      {/* ── Full selector ─────────────────────────────────────── */}
      {showSelector && (
        <div>
          {selectedService && (
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-blossome-gold hover:text-blossome-brown transition-colors font-medium"
            >
              <ChevronUp className="h-4 w-4" />
              Masquer le sélecteur
            </button>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : servicesByCategory ? (
            <Tabs defaultValue="coiffure" className="w-full">
              <TabsList className="mb-6 flex w-full flex-wrap gap-1 rounded-xl bg-blossome-cream/80 p-1.5">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-blossome-mid transition-all data-[active]:bg-white data-[active]:text-blossome-brown data-[active]:shadow-sm hover:text-blossome-brown"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {CATEGORIES.map((cat) => (
                <TabsContent key={cat.value} value={cat.value}>
                  {servicesByCategory[cat.value]?.length > 0 ? (
                    <div className="grid gap-3">
                      {servicesByCategory[cat.value].map((service) => {
                        const isSelected = selectedService?.id === service.id;

                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              onServiceSelect(service);
                              setShowSelector(false);
                            }}
                            className={`group relative w-full rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                              isSelected
                                ? 'border-blossome-gold bg-blossome-gold-lt/30'
                                : 'border-blossome-taupe/20 bg-white hover:border-blossome-gold/50'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blossome-gold text-white">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <h4 className="font-display text-base font-semibold text-blossome-brown pr-7">
                              {service.name}
                            </h4>
                            {service.description && (
                              <p className="text-xs text-blossome-mid mt-0.5 line-clamp-1">
                                {service.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-4">
                              <Badge
                                variant="secondary"
                                className="bg-blossome-cream text-blossome-mid text-[11px]"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                {service.duration_minutes} min
                              </Badge>
                              <span className="text-sm font-bold text-blossome-gold">
                                {formatPrice(service.price_mga)} MGA
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-blossome-mid">
                      Aucun service disponible dans cette catégorie.
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : null}
        </div>
      )}
    </div>
  );
}
