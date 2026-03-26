import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getServices } from '@/lib/data/services';
import { ServiceCategoryTabs } from '@/components/services/ServiceCategoryTabs';
import type { Service, ServiceCategory } from '@/lib/types';

/* ── SEO Metadata ─────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Nos Services | Blossome Institut de Beauté',
  description:
    'Découvrez tous nos services de beauté à Antananarivo : coiffure, esthétique, onglerie, maquillage. Tarifs et réservation en ligne.',
  openGraph: {
    title: 'Nos Services | Blossome Institut de Beauté',
    description:
      'Découvrez tous nos services de beauté à Antananarivo : coiffure, esthétique, onglerie, maquillage. Tarifs et réservation en ligne.',
    images: [
      {
        url: '/og-services.jpg',
        width: 1200,
        height: 630,
        alt: 'Services Blossome Institut de Beauté Antananarivo',
      },
    ],
  },
  alternates: {
    canonical: 'https://blossomeinstitute.com/services',
  },
};

/* ── Page Component ───────────────────────────────────────────────── */
export default async function ServicesPage() {
  const allServices = await getServices();

  /* Group services by category */
  const grouped: Record<ServiceCategory, Service[]> = {
    coiffure: [],
    esthetique: [],
    onglerie: [],
    maquillage: [],
  };
  for (const s of allServices) {
    grouped[s.category].push(s);
  }

  /* ── JSON-LD: ItemList ──────────────────────────────────────────── */
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Services Blossome Institut de Beauté',
    itemListElement: allServices.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        url: `https://blossomeinstitute.com/services/${s.slug}`,
        ...(s.image_url ? { image: s.image_url } : {}),
        offers: {
          '@type': 'Offer',
          price: s.price_mga,
          priceCurrency: 'MGA',
        },
      },
    })),
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
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <section className="relative bg-blossome-brown py-20 md:py-28">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(201,169,110,0.15),_transparent_70%)]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d'ariane"
            className="mb-6 flex items-center gap-1.5 text-sm text-blossome-taupe/80"
          >
            <Link
              href={"/" as never}
              className="transition-colors hover:text-blossome-gold"
            >
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blossome-gold-lt font-medium">Services</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
            Nos Prestations
          </h1>
          <p className="max-w-xl text-blossome-taupe text-sm md:text-base">
            Des soins d&apos;exception pour sublimer votre beauté naturelle.
            Découvrez notre gamme complète de services et réservez en ligne.
          </p>
        </div>
      </section>

      {/* ── Services Grid with Tabs ───────────────────────────── */}
      <section className="py-16 md:py-24 bg-blossome-cream">
        <div className="container mx-auto px-4 md:px-6">
          <ServiceCategoryTabs services={grouped} />
        </div>
      </section>
    </>
  );
}
