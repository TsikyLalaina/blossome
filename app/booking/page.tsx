import type { Metadata } from 'next';
import { getServiceBySlug } from '@/lib/data/services';
import { BookingWizard } from '@/components/booking/BookingWizard';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Réserver | Blossome',
    description:
      'Réservez votre rendez-vous beauté chez Blossome Institut de Beauté à Antananarivo. Coiffure, esthétique, onglerie et maquillage.',
    robots: { index: false, follow: false },
  };
}

import { Suspense } from 'react';

/**
 * Validates the service slug from search params:
 * - Must be a non-empty string
 * - Max 100 chars
 * - Only lowercase letters, digits, and hyphens
 */
function validateSlug(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return null;
  if (!/^[a-z0-9\-]+$/.test(trimmed)) return null;
  return trimmed;
}

interface BookingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function BookingContent({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const slug = validateSlug(params.service);

  // If a valid slug is provided, fetch the service server-side
  const initialService = slug ? await getServiceBySlug(slug) : null;

  return <BookingWizard initialService={initialService} />;
}

export default function BookingPage(props: BookingPageProps) {
  return (
    <main className="min-h-screen bg-blossome-cream">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-blossome-brown text-center mb-2">
          Réservation
        </h1>
        <p className="text-blossome-mid text-center mb-10 text-sm">
          Réservez votre rendez-vous en quelques étapes simples
        </p>
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-blossome-mid">Chargement du système de réservation...</div>}>
          <BookingContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
