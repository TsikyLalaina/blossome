import Image from 'next/image';
import Link from 'next/link';

const stats = [
  { value: '5+', label: 'ans d\'expérience' },
  { value: '26K', label: 'abonnés' },
  { value: '100+', label: 'clientes satisfaites' },
];

export function AboutTeaserSection() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-label="Notre savoir-faire">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/about-teaser.jpg"
              alt="Intérieur de Blossome Institut de Beauté"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="font-cormorant italic text-blossome-gold text-lg mb-3">
              Depuis 2019
            </p>
            <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-blossome-brown mb-6 leading-tight">
              Notre Savoir-Faire
            </h2>
            <p className="font-inter text-blossome-mid text-sm md:text-base leading-relaxed mb-4">
              Chez Blossome, nous croyons que chaque femme mérite de se sentir exceptionnelle.
              Notre institut, niché au cœur d&apos;Ankadivato à Antananarivo, est un sanctuaire
              dédié à la beauté et au bien-être.
            </p>
            <p className="font-inter text-blossome-mid text-sm md:text-base leading-relaxed mb-8">
              Notre équipe de professionnelles passionnées maîtrise les dernières techniques
              en coiffure, esthétique, onglerie et maquillage pour vous offrir une expérience
              de transformation unique.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex-1 min-w-[100px] bg-blossome-cream rounded-xl px-4 py-5 text-center border border-blossome-taupe/20"
                >
                  <span className="block font-cormorant text-2xl md:text-3xl font-bold text-blossome-gold">
                    {stat.value}
                  </span>
                  <span className="font-inter text-xs text-blossome-mid mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={"/a-propos" as never}
              className="self-start inline-flex items-center px-6 py-3 font-inter text-sm font-medium text-blossome-brown border-2 border-blossome-brown rounded hover:bg-blossome-brown hover:text-white transition-colors"
            >
              Découvrir notre histoire →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
