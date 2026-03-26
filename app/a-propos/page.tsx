import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { BrandStory } from '@/components/about/BrandStory';
import { ValuesSection } from '@/components/about/ValuesSection';
import { StaffGrid } from '@/components/about/StaffGrid';
import { PressSection } from '@/components/about/PressSection';

/* ── SEO Metadata ─────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'À Propos | Blossome Institut de Beauté Antananarivo',
  description:
    "Découvrez l'histoire de Blossome, notre équipe d'expertes en beauté et notre engagement pour l'excellence à Antananarivo.",
  openGraph: {
    title: 'À Propos | Blossome Institut de Beauté Antananarivo',
    description:
      "Découvrez l'histoire de Blossome, notre équipe d'expertes en beauté et notre engagement pour l'excellence à Antananarivo.",
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Blossome Institut de Beauté — Notre Histoire',
      },
    ],
  },
  alternates: {
    canonical: 'https://blossomeinstitute.com/a-propos',
  },
};

/* ── Page Component ───────────────────────────────────────────────── */
export default function AProposPage() {
  /* ── JSON-LD: Person (Francia Martinez) + Organization ──────────── */
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Francia Martinez',
    jobTitle: 'Fondatrice',
    worksFor: {
      '@type': 'BeautySalon',
      name: 'Blossome Institut de Beauté',
      url: 'https://blossomeinstitute.com',
    },
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Blossome Institut de Beauté',
    url: 'https://blossomeinstitute.com',
    logo: 'https://blossomeinstitute.com/logo.png',
    founder: {
      '@type': 'Person',
      name: 'Francia Martinez',
    },
    foundingDate: '2019',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ankadivato',
      addressLocality: 'Antananarivo',
      addressCountry: 'MG',
    },
    sameAs: [
      'https://www.facebook.com/blossomeinstitut',
      'https://www.instagram.com/blossome_mdg',
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://blossomeinstitute.com' },
      { '@type': 'ListItem', position: 2, name: 'À Propos', item: 'https://blossomeinstitute.com/a-propos' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <section className="relative bg-blossome-brown py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(201,169,110,0.15),_transparent_70%)]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <nav
            aria-label="Fil d'ariane"
            className="mb-6 flex items-center gap-1.5 text-sm text-blossome-taupe/80"
          >
            <Link href={"/" as never} className="transition-colors hover:text-blossome-gold">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blossome-gold-lt font-medium">À Propos</span>
          </nav>
          <h1 className="sr-only">À Propos de Blossome Institut de Beauté</h1>
        </div>
      </section>

      <BrandStory />
      <ValuesSection />

      <Suspense
        fallback={
          <div className="py-20 text-center text-blossome-mid">
            Chargement de l&apos;équipe…
          </div>
        }
      >
        <StaffGrid />
      </Suspense>

      <PressSection />
    </>
  );
}
