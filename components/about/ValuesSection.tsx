import { Gem, Award, Heart } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Luxe Accessible',
    description:
      'Nous croyons que chaque femme mérite des soins de qualité premium, sans compromis. Nos tarifs sont étudiés pour offrir l\'excellence à portée de toutes.',
  },
  {
    icon: Award,
    title: 'Expertise',
    description:
      'Notre équipe est formée aux dernières techniques internationales en coiffure, esthétique, onglerie et maquillage. Un savoir-faire reconnu à Antananarivo.',
  },
  {
    icon: Heart,
    title: 'Expérience Personnalisée',
    description:
      'Chaque cliente est unique. Nous prenons le temps de comprendre vos envies et de créer un parcours de soins sur-mesure qui vous correspond.',
  },
];

export function ValuesSection() {
  return (
    <section className="py-20 md:py-28 bg-blossome-cream" aria-label="Nos valeurs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-cormorant italic text-blossome-gold text-lg mb-2">
            Ce qui nous anime
          </p>
          <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-blossome-brown">
            Nos Valeurs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-blossome-taupe/10 hover:shadow-lg hover:border-blossome-gold/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-blossome-cream flex items-center justify-center mb-6 group-hover:bg-blossome-gold/10 transition-colors duration-300">
                <value.icon className="w-7 h-7 text-blossome-gold" />
              </div>
              <h3 className="font-cormorant text-xl md:text-2xl font-semibold text-blossome-brown mb-3">
                {value.title}
              </h3>
              <p className="text-blossome-mid text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
