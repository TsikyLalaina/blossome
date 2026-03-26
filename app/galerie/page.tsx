import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getGalleryItems } from '@/lib/data/gallery';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

/* ── SEO Metadata ─────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Galerie | Blossome Institut de Beauté',
  description:
    'Découvrez nos réalisations en coiffure, onglerie, esthétique et maquillage. Before/after, art nail, coiffures de mariage. Blossome Antananarivo.',
  openGraph: {
    title: 'Galerie | Blossome Institut de Beauté',
    description:
      'Découvrez nos réalisations en coiffure, onglerie, esthétique et maquillage. Before/after, art nail, coiffures de mariage. Blossome Antananarivo.',
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'Galerie Blossome Institut de Beauté Antananarivo',
      },
    ],
  },
  alternates: {
    canonical: 'https://blossomeinstitute.com/galerie',
  },
};

/* ── Page Component ───────────────────────────────────────────────── */
export default async function GaleriePage() {
  const items = await getGalleryItems();

  /* ── JSON-LD: ImageGallery ─────────────────────────────────────── */
  const gallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Galerie Blossome Institut de Beauté',
    description:
      'Nos réalisations en coiffure, onglerie, esthétique et maquillage à Antananarivo.',
    url: 'https://blossomeinstitute.com/galerie',
    ...(items.length > 0
      ? {
          image: items.slice(0, 10).map((item) => ({
            '@type': 'ImageObject',
            contentUrl: item.url,
            name: item.alt_text || `Réalisation ${item.category}`,
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://blossomeinstitute.com' },
      { '@type': 'ListItem', position: 2, name: 'Galerie', item: 'https://blossomeinstitute.com/galerie' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <section className="relative bg-blossome-brown py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(201,169,110,0.15),_transparent_70%)]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <nav
            aria-label="Fil d'ariane"
            className="mb-6 flex items-center gap-1.5 text-sm text-blossome-taupe/80"
          >
            <Link href={"/" as never} className="transition-colors hover:text-blossome-gold">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blossome-gold-lt font-medium">Galerie</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
            Notre Galerie
          </h1>
          <p className="max-w-xl text-blossome-taupe text-sm md:text-base">
            Découvrez nos réalisations et laissez-vous inspirer par le savoir-faire
            de nos artistes.
          </p>
        </div>
      </section>

      {/* ── Gallery Grid ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-blossome-cream">
        <div className="container mx-auto px-4 md:px-6">
          <GalleryGrid items={items} />
        </div>
      </section>
    </>
  );
}
