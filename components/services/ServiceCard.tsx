import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Service, ServiceCategory } from '@/lib/types';

const categoryConfig: Record<ServiceCategory, { label: string; color: string }> = {
  coiffure:   { label: 'Coiffure',    color: 'bg-blossome-brown text-white' },
  esthetique: { label: 'Esthétique',  color: 'bg-blossome-gold text-white' },
  onglerie:   { label: 'Onglerie',    color: 'bg-blossome-taupe text-blossome-dark' },
  maquillage: { label: 'Maquillage',  color: 'bg-blossome-mid text-white' },
};

function formatPrice(mga: number): string {
  return mga.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

export function ServiceCard({ service }: { service: Service }) {
  const cat = categoryConfig[service.category];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-blossome-taupe/20 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-blossome-cream">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={`${service.name} Antananarivo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl text-blossome-taupe/50">
              {service.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Category badge */}
        <Badge className={`absolute top-3 left-3 ${cat.color} border-0 text-[11px] tracking-wide uppercase`}>
          {cat.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-blossome-dark mb-2 line-clamp-1">
          {service.name}
        </h3>

        {service.description && (
          <p className="text-xs text-blossome-mid line-clamp-2 mb-4 flex-1">
            {service.description}
          </p>
        )}

        {/* Duration & Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-blossome-mid">
            <Clock className="w-3.5 h-3.5" />
            {service.duration_minutes} min
          </span>
          <span className="text-sm font-bold text-blossome-gold">
            {formatPrice(service.price_mga)} MGA
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/booking?service=${service.slug}` as never}
          aria-label={`Réserver ${service.name}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blossome-brown px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blossome-dark focus-visible:ring-2 focus-visible:ring-blossome-gold focus-visible:ring-offset-2"
        >
          Réserver
        </Link>
      </div>
    </article>
  );
}
