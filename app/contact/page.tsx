import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ContactHero } from '@/components/contact/ContactHero';
import { GoogleMapsEmbed } from '@/components/contact/GoogleMapsEmbed';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfoCards } from '@/components/contact/ContactInfoCards';

/* ── SEO Metadata ─────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Contact | Blossome — Ankadivato, Antananarivo',
  description:
    'Contactez Blossome Institut de Beauté. Adresse: Ankadivato, Antananarivo. Tel: 038 92 930 46. Horaires et formulaire de contact.',
  openGraph: {
    title: 'Contact | Blossome — Ankadivato, Antananarivo',
    description:
      'Contactez Blossome Institut de Beauté. Adresse: Ankadivato, Antananarivo. Tel: 038 92 930 46. Horaires et formulaire de contact.',
    images: [
      {
        url: '/og-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Blossome Institut de Beauté Antananarivo',
      },
    ],
  },
  alternates: {
    canonical: 'https://blossomeinstitute.com/contact',
  },
};

/* ── Page Component ───────────────────────────────────────────────── */
export default function ContactPage() {
  /* ── JSON-LD: LocalBusiness ────────────────────────────────────── */
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'BeautySalon'],
    name: 'Blossome Institut de Beauté',
    url: 'https://blossomeinstitute.com',
    telephone: '+261389293046',
    email: 'contact@blossomeinstitute.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ankadivato',
      addressLocality: 'Antananarivo',
      addressRegion: 'Analamanga',
      addressCountry: 'MG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -18.9101,
      longitude: 47.5312,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: 'MGA 15000–300000',
    image: 'https://blossomeinstitute.com/og-default.jpg',
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
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://blossomeinstitute.com/contact' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
            <span className="text-blossome-gold-lt font-medium">Contact</span>
          </nav>
        </div>
      </section>

      <ContactHero />
      <GoogleMapsEmbed />
      <ContactForm />
      <ContactInfoCards />
    </>
  );
}
