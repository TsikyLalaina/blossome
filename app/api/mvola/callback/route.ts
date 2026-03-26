import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const MvolaCallbackPayloadSchema = z.object({
  transactionStatus: z.enum(['completed', 'failed', 'pending']),
  serverCorrelationId: z.string(),
  transactionReference: z.string().optional(),
  requestDate: z.string(),
  debitParty: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  creditParty: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  fees: z.array(z.object({ feeAmount: z.string() })).optional(),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })).optional()
});

export async function POST(req: Request) {
  try {
    if (!process.env.MVOLA_CALLBACK_URL) {
      return NextResponse.json({ error: 'Not configured' }, { status: 404 });
    }

    const payload = await req.json();
    const parsedPayload = MvolaCallbackPayloadSchema.safeParse(payload);
    
    if (!parsedPayload.success) {
      console.error('Invalid Mvola callback payload', parsedPayload.error);
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const data = parsedPayload.data;
    
    // Verify creditParty matches our merchant number
    const creditPartyMsisdn = data.creditParty?.find(p => p.key === 'msisdn')?.value;
    if (creditPartyMsisdn !== process.env.MVOLA_PARTNER_MSISDN) {
      console.warn(`Spoof detected: creditParty ${creditPartyMsisdn} != ${process.env.MVOLA_PARTNER_MSISDN}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminSupabaseClient();
    
    // Look up transaction
    const { data: tx, error: txError } = await supabase
      .from('mvola_transactions')
      .select('id, booking_id, status')
      .eq('server_correlation_id', data.serverCorrelationId)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Store raw callback
    await supabase.from('mvola_transactions').update({
      raw_callback: payload
    }).eq('id', tx.id);

    if (data.transactionStatus === 'completed') {
      await supabase.from('mvola_transactions').update({
        status: 'completed',
        transaction_reference: data.transactionReference
      }).eq('id', tx.id);

      await supabase.from('bookings').update({
        status: 'confirmed',
        payment_reference: data.transactionReference
      }).eq('id', tx.booking_id);

      revalidateTag('bookings', 'max');

      // Async email/sms logic could go here
    } else if (data.transactionStatus === 'failed') {
      await supabase.from('mvola_transactions').update({
        status: 'failed'
      }).eq('id', tx.id);
    }
    
    // Always return 200 OK so Mvola stops retrying
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Mvola Callback Error:', error);
    // Even on server error, we return 200 to Mvola so they don't retry forever.
    // In strict environments we might return a 500 but Mvola retry loops can be aggressive.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
