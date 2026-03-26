import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import type { Service, ServiceCategory } from '@/lib/types';

/* ── Shared Supabase client (no cookies — safe inside "use cache") ── */
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ── Get all active services, optionally filtered by category ─────── */
export async function getServices(
  category?: ServiceCategory,
): Promise<Service[]> {
  'use cache';
  cacheTag('services');
  cacheLife('hours');

  let query = supabase()
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Service[];
}

/* ── Get a single service by slug ─────────────────────────────────── */
export async function getServiceBySlug(
  slug: string,
): Promise<Service | null> {
  'use cache';
  cacheTag('services', `service-${slug}`);
  cacheLife('hours');

  const { data, error } = await supabase()
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return (data as Service) ?? null;
}

/* ── Get related services (same category, excluding current) ──────── */
export async function getRelatedServices(
  category: ServiceCategory,
  excludeSlug: string,
): Promise<Service[]> {
  'use cache';
  cacheTag('services');
  cacheLife('hours');

  const { data, error } = await supabase()
    .from('services')
    .select('*')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data ?? []) as Service[];
}
