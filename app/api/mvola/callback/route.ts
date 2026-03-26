import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const MvolaCallbackPayloadSchema = z.object({
  transactionStatus: z.string(),
  serverCorrelationId: z.string().optional(),
  transactionReference: z.string().optional(),
  requestingOrganisationTransactionReference: z.string().optional(),
  requestDate: z.string().optional(),
  debitParty: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  creditParty: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })).optional()
}).passthrough();

interface MvolaParty { key: string; value: string; }

async function handleMvolaCallback(req: Request) {
  try {
    const payload = await req.json();
    console.log(`--- MVOLA CALLBACK START (${req.method}) ---`);
    console.log('Raw Payload:', JSON.stringify(payload, null, 2));

    if (!process.env.MVOLA_CALLBACK_URL) {
      console.error('MVOLA_CALLBACK_URL not configured in environment');
      return NextResponse.json({ error: 'Not configured' }, { status: 404 });
    }

    const parsedPayload = MvolaCallbackPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      console.error('Invalid Mvola callback payload schema:', parsedPayload.error);
    }

    // Use a typed reference for data to satisfy linter and maintain safety
    const data = (parsedPayload.success ? parsedPayload.data : payload) as z.infer<typeof MvolaCallbackPayloadSchema>;
    
    // Verify creditParty matches our merchant number (normalized)
    const creditParty = data.creditParty as MvolaParty[] | undefined;
    const creditPartyMsisdn = creditParty?.find((p: MvolaParty) => p.key === 'msisdn')?.value;
    const normalize = (num?: string) => num?.replace(/^(\+261|261|0)/, '') || '';
    
    if (normalize(creditPartyMsisdn) !== normalize(process.env.MVOLA_PARTNER_MSISDN)) {
      console.warn(`MSISDN mismatch: callback MSISDN is "${creditPartyMsisdn}", expected "${process.env.MVOLA_PARTNER_MSISDN}"`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminSupabaseClient();
    
    // Look up transaction by serverCorrelationId OR requestingOrganisationTransactionReference (bookingId)
    let txId: string | null = null;
    let bookingId: string | null = null;

    const { data: txByCorrelation } = await supabase
      .from('mvola_transactions')
      .select('id, booking_id')
      .eq('server_correlation_id', data.serverCorrelationId)
      .maybeSingle();

    if (txByCorrelation) {
      txId = txByCorrelation.id;
      bookingId = txByCorrelation.booking_id;
    } else if (data.requestingOrganisationTransactionReference) {
      // Fallback: look up by booking ID directly in the transactions table
      const { data: txByBooking } = await supabase
        .from('mvola_transactions')
        .select('id, booking_id')
        .eq('booking_id', data.requestingOrganisationTransactionReference)
        .maybeSingle();
      
      if (txByBooking) {
        txId = txByBooking.id;
        bookingId = txByBooking.booking_id;
      }
    }

    if (!txId || !bookingId) {
      console.error(`Transaction/Booking not found. CorrelationId: ${data.serverCorrelationId}, Ref: ${data.requestingOrganisationTransactionReference}`);
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Store raw callback for debugging
    await supabase.from('mvola_transactions').update({
      raw_callback: payload
    }).eq('id', txId);

    const status = data.transactionStatus?.toLowerCase();
    console.log(`Processing status: ${status} for Booking: ${bookingId}`);

    if (status === 'completed') {
      await supabase.from('mvola_transactions').update({
        status: 'completed',
        transaction_reference: data.transactionReference
      }).eq('id', txId);

      await supabase.from('bookings').update({
        status: 'confirmed',
        payment_reference: data.transactionReference
      }).eq('id', bookingId);

      revalidateTag('bookings', 'max');
      console.log('Database updated: status -> confirmed');
    } else if (status === 'failed') {
      await supabase.from('mvola_transactions').update({
        status: 'failed'
      }).eq('id', txId);
    }
    
    console.log(`--- MVOLA CALLBACK END (${req.method} Success) ---`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Mvola Callback Error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

export async function POST(req: Request) {
  return handleMvolaCallback(req);
}

export async function PUT(req: Request) {
  return handleMvolaCallback(req);
}
