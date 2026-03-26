'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem, ServiceCategory } from '@/lib/types';

const CATEGORIES: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'coiffure', label: 'Coiffure' },
  { value: 'esthetique', label: 'Esthétique' },
  { value: 'onglerie', label: 'Onglerie' },
  { value: 'maquillage', label: 'Maquillage' },
];

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const filtered = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  /* ── Keyboard navigation ─────────────────────────────── */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightboxIndex, goNext, goPrev]);

  /* ── Focus trap ──────────────────────────────────────── */
  useEffect(() => {
    if (lightboxIndex !== null) {
      lightboxRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  return (
    <>
      {/* ── Category Filter ─────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${activeCategory === cat.value
                ? 'bg-blossome-brown text-white shadow-lg shadow-blossome-brown/25'
                : 'bg-white text-blossome-mid border border-blossome-taupe/30 hover:border-blossome-gold hover:text-blossome-brown'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Masonry Grid ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="text-center text-blossome-mid py-20">
          Aucune image dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={item.url}
                  alt={item.alt_text || `Photo galerie Blossome — ${item.category}`}
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDRDNEIwIi8+PC9zdmc+"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blossome-brown/0 group-hover:bg-blossome-brown/20 transition-colors duration-300 flex items-end">
                  <span className="p-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                    {item.alt_text || item.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            ref={lightboxRef}
            tabIndex={-1}
            role="dialog"
            aria-label={`Galerie photo, ${filtered.length} images`}
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fermer la galerie"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].url}
                alt={filtered[lightboxIndex].alt_text || `Photo galerie Blossome`}
                width={1200}
                height={900}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                sizes="90vw"
                priority
              />
              {filtered[lightboxIndex].alt_text && (
                <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm text-center bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
                  {filtered[lightboxIndex].alt_text}
                </p>
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Counter */}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {filtered.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
