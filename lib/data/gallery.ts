import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import type { GalleryItem, ServiceCategory } from '@/lib/types';

/* ── Shared Supabase client (no cookies — safe inside "use cache") ── */
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ── Get gallery items, optionally filtered by category ────────────── */
export async function getGalleryItems(
  category?: ServiceCategory,
): Promise<GalleryItem[]> {
  'use cache';
  cacheTag('gallery');
  cacheLife('hours');

  let query = supabase()
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    // If the table doesn't exist yet (PGRST205), return empty to allow build
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return (data ?? []) as GalleryItem[];
}
