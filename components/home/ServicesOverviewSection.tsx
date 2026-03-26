import { createClient } from '@supabase/supabase-js';
import type { ServiceCategory } from '@/lib/types';
import Link from 'next/link';
import { Scissors, Sparkles, Hand, Palette } from 'lucide-react';

const categoryMeta: Record<ServiceCategory, { label: string; icon: React.ReactNode }> = {
  coiffure: { label: 'Coiffure', icon: <Scissors className="w-8 h-8" /> },
  esthetique: { label: 'Esthétique', icon: <Sparkles className="w-8 h-8" /> },
  onglerie: { label: 'Onglerie', icon: <Hand className="w-8 h-8" /> },
  maquillage: { label: 'Maquillage', icon: <Palette className="w-8 h-8" /> },
};

async function getServiceOverview() {
  'use cache';

  // Use a plain Supabase client (no cookies) for public data,
  // since 'use cache' is incompatible with cookies().
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const categories: ServiceCategory[] = ['coiffure', 'esthetique', 'onglerie', 'maquillage'];

  const results = await Promise.all(
    categories.map(async (cat) => {
      const { data, count } = await supabase
        .from('services')
        .select('id, name, description, image_url', { count: 'exact' })
        .eq('category', cat)
        .eq('is_active', true)
        .limit(1)
        .single();

      return {
        category: cat,
        featured: data,
        count: count ?? 0,
      };
    })
  );

  return results;
}

export async function ServicesOverviewSection() {
  let services;
  try {
    services = await getServiceOverview();
  } catch {
    // Fallback if DB is not available yet (dev)
    services = (['coiffure', 'esthetique', 'onglerie', 'maquillage'] as ServiceCategory[]).map(
      (cat) => ({ category: cat, featured: null, count: 0 })
    );
  }

  return (
    <section className="py-20 md:py-28 bg-blossome-cream" aria-label="Nos prestations de beauté">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-blossome-brown text-center mb-4">
          Nos Prestations
        </h2>
        <p className="font-inter text-blossome-mid text-center max-w-lg mx-auto mb-14 text-sm md:text-base">
          Des soins d&apos;exception pour sublimer votre beauté naturelle
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map(({ category, featured, count }) => {
            const meta = categoryMeta[category];
            return (
              <Link
                key={category}
                href={`/services?category=${category}` as never}
                className="group relative bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-blossome-taupe/30"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blossome-gold/10 text-blossome-gold mb-5 group-hover:bg-blossome-gold group-hover:text-white transition-colors duration-300">
                  {meta.icon}
                </div>
                <h3 className="font-cormorant text-xl font-semibold text-blossome-dark mb-2">
                  {meta.label}
                </h3>
                {featured?.description && (
                  <p className="font-inter text-xs text-blossome-mid line-clamp-2 mb-3">
                    {featured.description}
                  </p>
                )}
                <span className="font-inter text-xs text-blossome-gold font-medium">
                  {count} service{count > 1 ? 's' : ''} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
