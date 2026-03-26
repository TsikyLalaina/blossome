import Image from 'next/image';

export function BrandStory() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-label="Notre histoire">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/about-brand.jpg"
              alt="Francia Martinez, fondatrice de Blossome Institut de Beauté"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="font-cormorant italic text-blossome-gold text-lg mb-3">
              Depuis 2019
            </p>
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-semibold text-blossome-brown mb-6 leading-tight">
              Notre Histoire
            </h1>
            <div className="space-y-4 text-blossome-mid text-sm md:text-base leading-relaxed">
              <p>
                Blossome est né de la vision de <strong className="text-blossome-brown">Francia Martinez</strong>,
                une passionnée de beauté convaincue que chaque femme mérite de se sentir
                exceptionnelle. Après des années d&apos;expérience dans les plus grands salons,
                elle a créé un espace unique au cœur d&apos;Antananarivo.
              </p>
              <p>
                Niché à <strong className="text-blossome-brown">Ankadivato</strong>, notre
                institut est un véritable sanctuaire dédié à la beauté et au bien-être.
                Ici, chaque soin est une expérience personnalisée, alliant techniques
                internationales et produits de qualité professionnelle.
              </p>
              <p>
                Notre mission : rendre le luxe accessible et offrir à nos clientes
                une transformation qui va au-delà de l&apos;apparence, pour révéler leur
                confiance intérieure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
