import { MapPin, Phone, MessageCircle, Clock } from 'lucide-react';

const cards = [
  {
    icon: MapPin,
    title: 'Adresse',
    content: 'Ankadivato, Antananarivo, Madagascar',
    href: 'https://www.google.com/maps/search/Ankadivato+Antananarivo',
    linkText: 'Voir sur la carte',
    external: true,
  },
  {
    icon: Phone,
    title: 'Téléphone',
    content: '038 92 930 46',
    href: 'tel:+261389293046',
    linkText: 'Appeler',
    external: false,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    content: 'Écrivez-nous sur WhatsApp',
    href: 'https://wa.me/261389293046?text=Bonjour%20Blossome%20!',
    linkText: 'Envoyer un message',
    external: true,
  },
  {
    icon: Clock,
    title: 'Horaires',
    content: 'Lun – Sam : 09h00 – 18h00',
    href: undefined,
    linkText: undefined,
    external: false,
  },
];

export function ContactInfoCards() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-label="Coordonnées">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col items-center text-center p-6 bg-blossome-cream/50 rounded-2xl border border-blossome-taupe/10 hover:shadow-lg hover:border-blossome-gold/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-blossome-gold/10 flex items-center justify-center mb-4 group-hover:bg-blossome-gold/20 transition-colors">
                <card.icon className="w-7 h-7 text-blossome-gold" />
              </div>
              <h3 className="font-cormorant text-lg font-semibold text-blossome-brown mb-2">
                {card.title}
              </h3>
              <p className="text-blossome-mid text-sm mb-3">
                {card.content}
              </p>
              {card.href && card.linkText && (
                <a
                  href={card.href}
                  {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-sm font-medium text-blossome-gold hover:text-blossome-brown transition-colors"
                >
                  {card.linkText} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
