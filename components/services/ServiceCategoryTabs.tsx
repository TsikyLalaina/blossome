'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Scissors, Sparkles, Hand, Palette } from 'lucide-react';
import type { Service, ServiceCategory } from '@/lib/types';
import { ServiceCard } from './ServiceCard';

const categories: { value: ServiceCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'coiffure',   label: 'Coiffure',   icon: <Scissors className="w-4 h-4" /> },
  { value: 'esthetique', label: 'Esthétique',  icon: <Sparkles className="w-4 h-4" /> },
  { value: 'onglerie',   label: 'Onglerie',   icon: <Hand className="w-4 h-4" /> },
  { value: 'maquillage', label: 'Maquillage',  icon: <Palette className="w-4 h-4" /> },
];

interface ServiceCategoryTabsProps {
  services: Record<ServiceCategory, Service[]>;
}

export function ServiceCategoryTabs({ services }: ServiceCategoryTabsProps) {
  return (
    <Tabs defaultValue="coiffure" className="w-full">
      <TabsList className="mx-auto mb-10 flex w-fit flex-wrap gap-1 rounded-xl bg-blossome-cream/80 p-1.5 shadow-inner">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.value}
            value={cat.value}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-blossome-mid transition-all data-[active]:bg-white data-[active]:text-blossome-brown data-[active]:shadow-sm hover:text-blossome-brown"
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((cat) => (
        <TabsContent key={cat.value} value={cat.value}>
          {services[cat.value]?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services[cat.value].map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-blossome-mid text-sm">
                Aucun service disponible dans cette catégorie pour le moment.
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
