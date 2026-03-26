import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, CreditCard } from 'lucide-react';
import { getServiceBySlug, getRelatedServices, getServices } from '@/lib/data/services';
import { ServiceCard } from '@/components/services/ServiceCard';

/* ── SSG: generate all slugs at build time ────────────────────────── */
export async function generateStaticParams() {
  try {
    const services = await getServices();
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

/* ── Dynamic Metadata ─────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: 'Service introuvable' };
  }

  const description =
    service.description && service.description.length > 155
      ? service.description.slice(0, 155) + '… Réservez en ligne.'
      : (service.description ?? 'Réservez en ligne chez Blossome.');

  return {
    title: `${service.name} | Blossome Antananarivo`,
    description,
    openGraph: {
      title: `${service.name} | Blossome Antananarivo`,
      description,
      ...(service.image_url
        ? { images: [{ url: service.image_url, width: 1200, height: 630, alt: service.name }] }
        : {}),
    },
    alternates: {
      canonical: `https://blossomeinstitute.com/services/${slug}`,
    },
  };
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function formatPrice(mga: number): string {
  return mga.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

const categoryLabels: Record<string, string> = {
  coiffure: 'Coiffure',
  esthetique: 'Esthétique',
  onglerie: 'Onglerie',
  maquillage: 'Maquillage',
};

/* ── Page Component ───────────────────────────────────────────────── */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const related = await getRelatedServices(service.category, service.slug);
  const deposit = Math.round((service.price_mga * service.deposit_percent) / 100);

  /* ── JSON-LD: Service ───────────────────────────────────────────── */
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'BeautySalon',
      name: 'Blossome Institut de Beauté',
      url: 'https://blossomeinstitute.com',
    },
    ...(service.image_url ? { image: service.image_url } : {}),
    offers: {
      '@type': 'Offer',
      price: service.price_mga,
      priceCurrency: 'MGA',
    },
  };

  /* ── JSON-LD: BreadcrumbList ────────────────────────────────────── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://blossomeinstitute.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: 'https://blossomeinstitute.com/services',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: `https://blossomeinstitute.com/services/${service.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-blossome-brown">
        {/* Full-width image */}
        {service.image_url ? (
          <div className="relative h-64 md:h-80 lg:h-96 w-full">
            <Image
              src={service.image_url}
              alt={`${service.name} — Blossome Antananarivo`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blossome-brown/90 via-blossome-brown/40 to-transparent" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-blossome-brown to-blossome-dark" />
        )}

        <div className="container mx-auto px-4 md:px-6 relative z-10 -mt-20 md:-mt-24 pb-10 md:pb-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d'ariane"
            className="mb-4 flex items-center gap-1.5 text-sm text-blossome-taupe/80"
          >
            <Link
              href={"/" as never}
              className="transition-colors hover:text-blossome-gold"
            >
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={"/services" as never}
              className="transition-colors hover:text-blossome-gold"
            >
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blossome-gold-lt font-medium truncate max-w-[200px]">
              {service.name}
            </span>
          </nav>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white">
            {service.name}
          </h1>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-blossome-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Left: Description & details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category label */}
              <span className="inline-block rounded-full bg-blossome-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blossome-gold">
                {categoryLabels[service.category]}
              </span>

              {/* Full description */}
              {service.description && (
                <div className="prose prose-sm max-w-none text-blossome-dark/90">
                  <p className="text-base leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              )}

              {/* What's included */}
              <div className="rounded-xl bg-white border border-blossome-taupe/20 p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold text-blossome-dark mb-4">
                  Détails de la prestation
                </h2>
                <ul className="space-y-3 text-sm text-blossome-mid">
                  <li className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blossome-gold flex-shrink-0" />
                    <span>
                      Durée : <strong className="text-blossome-dark">{service.duration_minutes} minutes</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-blossome-gold flex-shrink-0" />
                    <span>
                      Catégorie : <strong className="text-blossome-dark">{categoryLabels[service.category]}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Sticky booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl bg-white border border-blossome-taupe/30 shadow-lg p-6 md:p-8 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-xs text-blossome-mid uppercase tracking-wide mb-1">
                    Tarif
                  </p>
                  <p className="text-3xl font-bold text-blossome-gold font-display">
                    {formatPrice(service.price_mga)}{' '}
                    <span className="text-base font-normal text-blossome-mid">MGA</span>
                  </p>
                </div>

                {/* Deposit */}
                {service.deposit_percent > 0 && (
                  <div className="rounded-lg bg-blossome-cream/70 border border-blossome-taupe/20 p-4">
                    <p className="text-xs text-blossome-mid mb-1">
                      Acompte à la réservation ({service.deposit_percent}%)
                    </p>
                    <p className="text-lg font-semibold text-blossome-dark">
                      {formatPrice(deposit)} MGA
                    </p>
                  </div>
                )}

                {/* Duration badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-blossome-gold/10 px-4 py-2 text-sm text-blossome-dark">
                  <Clock className="w-4 h-4 text-blossome-gold" />
                  Durée : {service.duration_minutes} min
                </div>

                {/* CTA */}
                <Link
                  href={`/booking?service=${service.slug}` as never}
                  aria-label={`Réserver ${service.name}`}
                  className="flex w-full items-center justify-center rounded-xl bg-blossome-brown px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blossome-dark hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blossome-gold focus-visible:ring-offset-2"
                >
                  Réserver maintenant
                </Link>

                <p className="text-center text-[11px] text-blossome-mid">
                  Réservation en ligne 24h/24 · Annulation gratuite 24h avant
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Services ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-blossome-dark text-center mb-10">
              Services similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={"/services" as never}
                className="inline-flex items-center gap-2 text-sm font-medium text-blossome-brown hover:text-blossome-gold transition-colors"
              >
                ← Voir tous les services
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
