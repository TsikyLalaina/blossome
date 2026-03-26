export function GoogleMapsEmbed() {
  const mapsKey = process.env.GOOGLE_MAPS_EMBED_KEY;

  return (
    <section className="py-0 bg-white" aria-label="Localisation">
      <div className="relative w-full h-[400px] md:h-[500px]">
        {mapsKey ? (
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=Ankadivato+Antananarivo`}
            title="Localisation de Blossome Institut de Beauté, Ankadivato Antananarivo"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
        ) : (
          /* Fallback when no API key is configured */
          <div className="w-full h-full bg-blossome-cream flex items-center justify-center">
            <a
              href="https://www.google.com/maps/search/Ankadivato+Antananarivo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blossome-gold hover:text-blossome-brown transition-colors font-medium"
            >
              Voir sur Google Maps →
            </a>
          </div>
        )}
        <noscript>
          <a
            href="https://www.google.com/maps/search/Ankadivato+Antananarivo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir Blossome Institut de Beauté sur Google Maps
          </a>
        </noscript>
      </div>
    </section>
  );
}
