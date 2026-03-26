import { notFound, redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Step5Confirmation } from '@/components/booking/Step5Confirmation';
import type { Booking, Service } from '@/lib/types';

export const metadata = {
  title: 'Réservation confirmée | Blossome',
  robots: {
    index: false,
    follow: false,
  },
};

import { Suspense } from 'react';

interface ConfirmPageProps {
  searchParams: Promise<{ id?: string; error?: string }>;
}

async function ConfirmContent({ searchParams }: ConfirmPageProps) {
  const params = await searchParams;
  const bookingRef = params.id;

  // Simple validation for the reference
  if (!bookingRef || typeof bookingRef !== 'string' || bookingRef.length < 8) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect('/booking?error=invalid_reference' as any);
  }

  // Use the admin client to bypass RLS for this specific public lookup
  const supabase = createAdminSupabaseClient();
  
  // Use exact match on the full UUID
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services (*)
    `)
    .eq('id', bookingRef)
    .single();

  if (error || !booking) {
    console.error('Confirm page fetch error:', error);
    notFound();
  }

  // Prevent users from accessing this page if they haven't confirmed payment
  if (booking.status !== 'confirmed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect('/booking?error=payment_not_confirmed' as any);
  }

  return (
    <Step5Confirmation 
      bookingId={bookingRef} 
      booking={booking as Booking} 
      service={booking.services as Service} 
    />
  );
}

export default function BookingConfirmPage(props: ConfirmPageProps) {
  return (
    <main className="min-h-screen bg-blossome-cream py-12 md:py-24">
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center text-blossome-mid">
            Récupération de votre réservation...
          </div>
        }>
          <ConfirmContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
