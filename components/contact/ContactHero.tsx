import { MapPin, Phone, Clock } from 'lucide-react';

const hours = [
  { day: 'Lundi – Vendredi', time: '09:00 – 18:00' },
  { day: 'Samedi', time: '09:00 – 18:00' },
  { day: 'Dimanche', time: 'Fermé' },
];

export function ContactHero() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-label="Informations de contact">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="font-cormorant italic text-blossome-gold text-lg mb-3">
            À votre écoute
          </p>
          <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-semibold text-blossome-brown mb-6">
            Nous Contacter
          </h1>
          <p className="text-blossome-mid text-sm md:text-base leading-relaxed">
            Une question, un rendez-vous ou une demande spéciale ?
            Nous sommes là pour vous aider.
          </p>
        </div>

        {/* Quick info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Address */}
          <div className="text-center p-6 bg-blossome-cream/50 rounded-2xl border border-blossome-taupe/10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blossome-gold/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blossome-gold" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-blossome-brown mb-1">Adresse</h3>
            <p className="text-blossome-mid text-sm">Ankadivato, Antananarivo<br />Madagascar</p>
          </div>

          {/* Phone */}
          <div className="text-center p-6 bg-blossome-cream/50 rounded-2xl border border-blossome-taupe/10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blossome-gold/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-blossome-gold" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-blossome-brown mb-1">Téléphone</h3>
            <a
              href="tel:+261389293046"
              className="text-blossome-mid text-sm hover:text-blossome-gold transition-colors"
            >
              038 92 930 46
            </a>
          </div>

          {/* Hours */}
          <div className="text-center p-6 bg-blossome-cream/50 rounded-2xl border border-blossome-taupe/10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blossome-gold/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blossome-gold" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-blossome-brown mb-2">Horaires</h3>
            <div className="space-y-1">
              {hours.map((h) => (
                <div key={h.day} className="flex justify-between text-xs text-blossome-mid gap-2">
                  <span>{h.day}</span>
                  <span className={h.time === 'Fermé' ? 'text-destructive' : 'font-medium text-blossome-brown'}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
