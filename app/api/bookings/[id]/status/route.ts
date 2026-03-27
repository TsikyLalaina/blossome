import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    z.string().uuid().parse(id);
  } catch {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('status, id')
    .eq('id', id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { 
      status: booking.status, 
      bookingId: booking.id, // Full UUID for internal use/redirects
      bookingRef: booking.id.slice(0, 8).toUpperCase() // Short code for display
    },
    { 
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' 
      } 
    }
  );
}
