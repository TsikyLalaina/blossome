'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/* ── Input validation schemas ────────────────────────────── */
const getAvailableDatesInput = z.object({
  serviceId: z.string().uuid(),
  year: z.number().int().min(2024).max(2030),
  month: z.number().int().min(1).max(12),
});

const getAvailableSlotsInput = z.object({
  serviceId: z.string().uuid(),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
  staffId: z.string().uuid().optional(),
});

/* ── Types ───────────────────────────────────────────────── */
export interface TimeSlot {
  id: string; // Slot UUID from availability_slots
  timeString: string;
  timeStringEnd: string;
  slotStart: string; // ISO date-time string mapped to slot_start
  slotEnd: string;
  available: boolean;
}

const TIMEZONE = 'Africa/Nairobi';

/* ── Get available dates for a month ─────────────────────── */
export async function getAvailableDates(
  serviceId: string,
  year: number,
  month: number
): Promise<string[]> {
  const parsed = getAvailableDatesInput.safeParse({ serviceId, year, month });
  if (!parsed.success) throw new Error('Paramètres invalides');

  const supabase = await createServerSupabaseClient();

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+03:00`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59+03:00`;

  // Pre-filter: today
  const today = new Date();
  const todayStr = today.toISOString(); // strict filter against past slots globally

  const { data: slots, error } = await supabase
    .from('availability_slots')
    .select('slot_start')
    .eq('is_blocked', false)
    .gte('slot_start', monthStart)
    .lte('slot_start', monthEnd)
    .gte('slot_start', todayStr);

  if (error) throw new Error('Erreur bdd');

  const dateSet = new Set<string>();
  for (const slot of slots || []) {
    const d = new Date(slot.slot_start);
    const localDateStr = d.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
    dateSet.add(localDateStr);
  }

  return Array.from(dateSet);
}

/* ── Get available slots for a specific day ──────────────── */
export async function getAvailableSlotsForDay(
  serviceId: string,
  dateStr: string,
  staffId?: string
): Promise<TimeSlot[]> {
  const parsed = getAvailableSlotsInput.safeParse({ serviceId, dateStr, staffId });
  if (!parsed.success) throw new Error('Paramètres invalides');

  const supabase = await createServerSupabaseClient();

  // "2026-03-25" -> Start of day to End of day in UTC+3
  const dayStart = `${dateStr}T00:00:00+03:00`;
  const dayEnd = `${dateStr}T23:59:59+03:00`;

  let availQuery = supabase
    .from('availability_slots')
    .select('id, slot_start, slot_end, is_blocked')
    .gte('slot_start', dayStart)
    .lte('slot_start', dayEnd);

  if (staffId) {
    availQuery = availQuery.eq('staff_id', staffId);
  }

  const { data: availSlots, error } = await availQuery;
  if (error) throw new Error('Erreur bdd');

  const now = new Date().toISOString();
  
  const slots: TimeSlot[] = [];
  for (const s of availSlots || []) {
    const startObj = new Date(s.slot_start);
    const endObj = new Date(s.slot_end);
    
    // Format to "HH:mm" in Africa/Nairobi
    const timeString = startObj.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
    const timeStringEnd = endObj.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

    slots.push({
      id: s.id,
      timeString,
      timeStringEnd,
      slotStart: s.slot_start,
      slotEnd: s.slot_end,
      // Block if already past or natively blocked
      available: !s.is_blocked && s.slot_start > now,
    });
  }

  return slots.sort((a, b) => a.timeString.localeCompare(b.timeString));
}
