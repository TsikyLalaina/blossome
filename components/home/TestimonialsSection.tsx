'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  service: string;
  rating: number;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Nomena R.',
    service: 'Coiffure & Maquillage',
    rating: 5,
    quote: 'Une expérience incroyable ! L\'équipe de Blossome a su parfaitement réaliser ma coiffure et mon maquillage pour mon mariage. Résultat au-delà de mes attentes.',
  },
  {
    name: 'Hasina M.',
    service: 'Onglerie',
    rating: 5,
    quote: 'Des ongles magnifiques qui durent ! Le nail art est d\'une finesse exceptionnelle. Je ne vais nulle part ailleurs depuis que j\'ai découvert Blossome.',
  },
  {
    name: 'Voahirana T.',
    service: 'Esthétique',
    rating: 5,
    quote: 'Les soins du visage chez Blossome sont un vrai moment de bonheur. Ma peau n\'a jamais été aussi belle. Le cadre est luxueux et l\'équipe adorable.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-blossome-gold text-blossome-gold' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-blossome-cream overflow-hidden" aria-label="Témoignages clients">
      <div className="container mx-auto px-4 md:px-6">
        <p className="font-cormorant italic text-blossome-gold text-lg text-center mb-3">
          Témoignages
        </p>
        <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-blossome-brown text-center mb-14">
          Elles nous font confiance
        </h2>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-blossome-taupe/20 flex flex-col"
            >
              <StarRating rating={t.rating} />
              <blockquote className="font-inter text-sm text-blossome-mid leading-relaxed mt-4 mb-6 flex-grow">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-inter font-semibold text-blossome-dark text-sm">{t.name}</p>
                <p className="font-inter text-xs text-blossome-gold">{t.service}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 no-scrollbar">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="min-w-[85vw] bg-white rounded-xl p-6 shadow-sm border border-blossome-taupe/20 flex flex-col snap-center"
            >
              <StarRating rating={t.rating} />
              <blockquote className="font-inter text-sm text-blossome-mid leading-relaxed mt-4 mb-6 flex-grow">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-inter font-semibold text-blossome-dark text-sm">{t.name}</p>
                <p className="font-inter text-xs text-blossome-gold">{t.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
