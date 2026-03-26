import { ExternalLink } from 'lucide-react';

export function PressSection() {
  return (
    <section className="py-20 md:py-28 bg-blossome-cream" aria-label="Presse">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-cormorant italic text-blossome-gold text-lg mb-2">
            Ils parlent de nous
          </p>
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-blossome-brown mb-12">
            Dans la Presse
          </h2>

          {/* Jejoo mention */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-blossome-taupe/10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blossome-gold/10 text-blossome-gold rounded-full text-sm font-medium mb-6">
              <ExternalLink className="w-4 h-4" />
              Jejoo Magazine
            </div>

            {/* Quote */}
            <blockquote className="font-cormorant text-xl md:text-2xl lg:text-3xl text-blossome-brown italic leading-relaxed mb-6">
              &ldquo;Blossome redéfinit les standards de la beauté à Antananarivo.
              Un institut où l&apos;excellence se mêle à une atmosphère chaleureuse
              et accueillante.&rdquo;
            </blockquote>

            <cite className="not-italic text-blossome-mid text-sm">
              — Jejoo Magazine, Antananarivo
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}
