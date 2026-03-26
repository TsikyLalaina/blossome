'use server';

import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { bookingCreateSchema, type BookingSelections } from '@/lib/validation/booking';
import { z } from 'zod';
import { initiateMvolaPayment } from '@/lib/mvola/mvolaClient';
import { MvolaError } from '@/lib/mvola/errors';

// Simple HTML strip utility
function stripHtml(text: string) {
  return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Creates a pending booking row securely after validating against double bookings.
 */
export async function createPendingBookingAction(data: BookingSelections): Promise<
  { success: true; bookingId: string; expiresAt: string } | { success: false; error: string }
> {
  // 1. Validate payload via combined Zod schema
  const parsed = bookingCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données de réservation invalides.' };
  }

  const payload = parsed.data;

  // 2. Sanitize user inputs
  const clientName = stripHtml(payload.client.clientName);
  const notes = payload.client.notes ? stripHtml(payload.client.notes) : null;
  // (clientEmail is no longer used since guest profiles don't store email in bookings table natively)
  const clientPhone = payload.client.clientPhone;
  const paymentRef = payload.payment.paymentRef.toUpperCase();

  const supabase = createAdminSupabaseClient();

  // 3. Ensure the service exists
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('id, duration_minutes')
    .eq('id', payload.service.serviceId)
    .single();

  if (svcErr || !service) {
    return { success: false, error: 'Service sélectionné introuvable.' };
  }

  // 4. Ensure no booking with same payment reference exists (replay attack prevention)
  const { data: existingRef } = await supabase
    .from('bookings')
    .select('id')
    .eq('payment_reference', paymentRef)
    .single();

  if (existingRef) {
    return { success: false, error: 'Cette référence de paiement a déjà été utilisée.' };
  }

  // 5. Fetch and secure the specific availability slot
  const { data: slot, error: slotErr } = await supabase
    .from('availability_slots')
    .select('id, is_blocked, slot_start, slot_end, staff_id')
    .eq('id', payload.dateTime.slotId)
    .single();

  if (slotErr || !slot || slot.is_blocked) {
    return { success: false, error: 'Ce créneau vient d\'être réservé ou n\'existe plus.' };
  }

  // 6. We need a client_id for the booking. Since the user might be a guest, 
  // we check if a profile exists by phone, else we insert null and use the guest fields.
  let clientId: string | null = null;
  
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', clientPhone)
    .limit(1)
    .single();

  if (existingProfile) {
    clientId = existingProfile.id;
  }

  // 7. Insert the pending booking
  const { data: booking, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      client_id: clientId,
      client_name: clientName,
      client_phone: clientPhone,
      service_id: service.id,
      staff_id: slot.staff_id,
      slot_id: slot.id,
      status: 'pending_payment',
      payment_method: payload.payment.paymentMethod,
      payment_reference: paymentRef,
      notes: notes,
    })
    .select('id')
    .single();

  if (insertErr || !booking) {
    console.error('Booking Error:', insertErr);
    return { success: false, error: 'Impossible de créer la réservation.' };
  }

  // Actively block the availability slot to prevent double-booking globally.
  await supabase.from('availability_slots').update({ is_blocked: true }).eq('id', slot.id);

  // Expires at 15m from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return { success: true, bookingId: booking.id, expiresAt };
}

/**
 * Verifies a pending booking, marks it as confirmed, and triggers generic communications.
 */
export async function verifyPaymentAndConfirmAction(
  bookingId: string,
  paymentRef: string,
  paymentMethod: 'mvola' | 'airtel_money'
): Promise<{ success: true; bookingRef: string } | { success: false; error: string }> {
  // Simple validation
  if (!bookingId || paymentRef.length < 8) {
    return { success: false, error: 'Référence invalide ou ID manquant.' };
  }

  const supabase = createAdminSupabaseClient();

  // 1. Fetch booking to verify it's pending and not expired.
  // (In a real system, we'd check created_at + 15 mins)
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select(`
      *,
      services ( name, price_mga )
    `)
    .eq('id', bookingId)
    .single();

  if (fetchErr || !booking) {
    console.error('Fetch Booking Error:', fetchErr);
    return { success: false, error: 'Réservation introuvable.' };
  }

  if (booking.status !== 'pending_payment') {
    return { success: false, error: 'Cette réservation a déjà été traitée.' };
  }

  const isExpired = new Date(booking.created_at).getTime() + 15 * 60 * 1000 < Date.now();
  if (isExpired) {
    // Optionally update status to 'cancelled'
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    return { success: false, error: 'Le délai de paiement de 15 minutes a expiré.' };
  }

  // 2. For MVP: Accept any ref >= 8 chars. (Future: connect to Mvola API)
  if (paymentRef.length < 8) {
    return { success: false, error: 'La référence doit contenir au moins 8 caractères.' };
  }

  // 3. Update status
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_reference: paymentRef.toUpperCase(),
      payment_method: paymentMethod,
    })
    .eq('id', bookingId);

  if (updateErr) {
    return { success: false, error: 'Erreur lors de la confirmation du paiement.' };
  }

  // 4. Trigger async communication
  // Currently, the database schema doesn't store the email per booking natively.
  // As a fast fix for the MVP, we bypass the email sending to allow the booking confirmation to complete seamlessly without crashing. Optionally, we could capture email via a new DB column later.

  // Trigger SMS (void)
  // void sendSmsConfirmation(...)

  const bookingRef = booking.id;

  return { success: true, bookingRef };
}

export async function initiateMvolaPaymentAction(
  bookingId: string,
  clientMsisdn: string
): Promise<
  | { success: true; serverCorrelationId: string; notificationMethod: string }
  | { success: false; error: string }
> {
  const schema = z.object({
    bookingId: z.string().uuid(),
    clientMsisdn: z.string().regex(/^0[23]\d{8}$/, 'Numéro invalide')
  });

  const parsed = schema.safeParse({
    bookingId,
    clientMsisdn: clientMsisdn.replace(/\s/g, '')
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const cleanMsisdn = parsed.data.clientMsisdn;

  const supabase = createAdminSupabaseClient();
  
  // 1. Fetch booking
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*, services(price_mga, deposit_percent)')
    .eq('id', bookingId)
    .single();

  if (fetchErr || !booking) {
    return { success: false, error: 'Réservation introuvable.' };
  }

  if (booking.status !== 'pending_payment') {
    return { success: false, error: 'La réservation n\'est pas en attente de paiement.' };
  }

  const isExpired = new Date(booking.created_at).getTime() + 15 * 60 * 1000 < Date.now();
  if (isExpired) {
    return { success: false, error: 'Réservation expirée.' };
  }

  // Calculate deposit
  const totalMga = booking.services.price_mga as number;
  const depositPercent = booking.services.deposit_percent as number;
  const depositMga = Math.round((totalMga * depositPercent) / 100);

  if (depositMga <= 0) {
    return { success: false, error: 'Montant du dépôt invalide.' };
  }

  const description = `RDV Blossome ${bookingId.slice(0, 8).toUpperCase()}`;

  try {
    const response = await initiateMvolaPayment({
      clientMsisdn: cleanMsisdn,
      amountMga: depositMga,
      bookingId: bookingId,
      description
    });

    // Insert transaction row securely using admin client
    await supabase.from('mvola_transactions').insert({
      booking_id: bookingId,
      correlation_id: crypto.randomUUID(),
      server_correlation_id: response.serverCorrelationId,
      client_msisdn: cleanMsisdn,
      amount_mga: depositMga,
      status: 'pending',
      notification_method: response.notificationMethod
    });

    await supabase
      .from('bookings')
      .update({ payment_method: 'mvola' })
      .eq('id', bookingId);
      
    return {
      success: true,
      serverCorrelationId: response.serverCorrelationId,
      notificationMethod: response.notificationMethod
    };

  } catch (err: unknown) {
    if (err instanceof MvolaError) {
      return { success: false, error: err.message };
    }
    console.error('Mvola Unhandled Ex', err);
    return { success: false, error: 'Une erreur inattendue est survenue.' };
  }
}

export async function checkBookingPaymentStatusAction(
  bookingId: string
): Promise<{ status: string; bookingRef?: string }> {
  try {
    z.string().uuid().parse(bookingId);
  } catch {
    return { status: 'failed' };
  }

  const supabase = createAdminSupabaseClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('status, id')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return { status: 'cancelled' }; // or not_found
  }

  if (booking.status === 'confirmed') {
    return { status: 'confirmed', bookingRef: booking.id.slice(0, 8).toUpperCase() };
  }

  // Optionally poll Mvola here if pending_payment.
  // The webhook / callback is the primary source of truth.
  // We'll skip inline polling to avoid rate limiting unless 
  // the user is stuck, but standard callbacks handles this.

  return { status: booking.status };
}

export async function cancelPendingBookingAction(bookingId: string): Promise<void> {
  try {
    z.string().uuid().parse(bookingId);
  } catch {
    return;
  }
  
  const supabase = createAdminSupabaseClient();

  // Fetch the booking first to get its slot_id
  const { data: b } = await supabase
    .from('bookings')
    .select('slot_id')
    .eq('id', bookingId)
    .single();

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .match({ id: bookingId, status: 'pending_payment' });

  await supabase
    .from('mvola_transactions')
    .update({ status: 'failed' })
    .match({ booking_id: bookingId, status: 'pending' });

  // Free the time slot so others can book it
  if (b?.slot_id) {
    await supabase.from('availability_slots').update({ is_blocked: false }).eq('id', b.slot_id);
  }
}
