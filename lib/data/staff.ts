import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import type { Staff } from '@/lib/types';

/* ── Shared Supabase client (no cookies — safe inside "use cache") ── */
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ── Get all active staff members ──────────────────────────────────── */
export async function getActiveStaff(): Promise<Staff[]> {
  'use cache';
  cacheTag('staff');
  cacheLife('hours');

  const { data, error } = await supabase()
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Staff[];
}
