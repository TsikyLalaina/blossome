import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesOverviewSection } from '@/components/home/ServicesOverviewSection';
import { AboutTeaserSection } from '@/components/home/AboutTeaserSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTABannerSection } from '@/components/home/CTABannerSection';
import { SectionSkeleton } from '@/components/home/SectionSkeleton';

export const metadata: Metadata = {
  title: 'Blossome Institut de Beauté de Luxe | Antananarivo',
  description:
    'Institut de beauté de luxe à Antananarivo. Coiffure, esthétique, onglerie, maquillage. Réservation en ligne 24h/24. Ankadivato, Madagascar.',
  keywords: [
    'institut beauté luxe Antananarivo',
    'salon beauté Antananarivo',
    'coiffure Antananarivo',
    'onglerie Madagascar',
    'maquillage mariage Tana',
  ],
  openGraph: {
    title: 'Blossome Institut de Beauté de Luxe | Antananarivo',
    description:
      'Institut de beauté de luxe à Antananarivo. Coiffure, esthétique, onglerie, maquillage. Réservation en ligne 24h/24. Ankadivato, Madagascar.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Blossome Institut de Beauté de Luxe Antananarivo',
      },
    ],
  },
  alternates: {
    canonical: 'https://blossomeinstitute.com',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Suspense fallback={<SectionSkeleton />}>
        <ServicesOverviewSection />
      </Suspense>

      <AboutTeaserSection />

      <TestimonialsSection />

      <CTABannerSection />
    </>
  );
}
