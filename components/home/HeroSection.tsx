'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: 'https://blossomeinstitute.com',
    },
  ],
};

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Blossome Institut de Beauté de Luxe, Antananarivo"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Background LCP Image */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={85}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-4 max-w-3xl mx-auto"
      >
        <motion.p
          variants={fadeUp}
          className="font-cormorant italic text-blossome-gold text-lg md:text-xl mb-4 tracking-wider"
        >
          L&apos;Art de la Beauté
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="font-cormorant font-bold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6"
        >
          Blossome Institut de Beauté de Luxe
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-inter text-white/80 text-base md:text-lg mb-10 max-w-xl mx-auto"
        >
          Votre transformation commence ici — Antananarivo, Madagascar
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={"/booking" as never}
            className="inline-flex items-center justify-center px-8 py-3.5 font-inter font-medium text-white bg-blossome-gold rounded hover:bg-blossome-brown transition-colors text-sm md:text-base"
          >
            Réserver maintenant
          </Link>
          <Link
            href={"/services" as never}
            className="inline-flex items-center justify-center px-8 py-3.5 font-inter font-medium text-white border border-white rounded hover:bg-white/10 transition-colors text-sm md:text-base"
          >
            Nos services
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
