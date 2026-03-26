import Link from 'next/link';

const ctaSchema = {
  '@context': 'https://schema.org',
  '@type': 'Action',
  name: 'Réserver chez Blossome',
  target: 'https://blossomeinstitute.com/booking',
};

export function CTABannerSection() {
  return (
    <section className="relative py-20 md:py-28 bg-blossome-brown overflow-hidden" aria-label="Réservation">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ctaSchema) }}
      />

      {/* Decorative accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blossome-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blossome-gold/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Prête à vous transformer ?
        </h2>
        <p className="font-inter text-white/70 text-sm md:text-base max-w-md mx-auto mb-10">
          Réservez votre rendez-vous en ligne et laissez-nous révéler votre beauté
        </p>
        <Link
          href={"/booking" as never}
          className="inline-flex items-center justify-center px-10 py-4 font-inter text-base font-semibold text-blossome-brown bg-blossome-gold rounded hover:bg-blossome-gold-lt transition-colors shadow-lg hover:shadow-xl"
        >
          Réserver maintenant
        </Link>
      </div>
    </section>
  );
}
