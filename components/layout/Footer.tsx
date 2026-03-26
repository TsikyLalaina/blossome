import Link from 'next/link';
import { MapPin, Phone, MessageCircle } from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          
          {/* Brand + Tagline + Socials */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-cormorant text-3xl font-semibold text-[#D4AF37]">
              BLOSSOME
            </h3>
            <p className="text-sm font-inter text-gray-400 max-w-xs">
              Institut de beauté de l&apos;excellence et du raffinement. 
              Sublimez votre beauté naturelle.
            </p>
            <div className="flex space-x-4 pt-4">
              <a 
                href="https://www.facebook.com/blossomeinstitut" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/blossome_mdg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-inter font-medium text-lg border-b border-gray-700 pb-2 w-max">
              Liens Rapides
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link href={"/services" as never} className="text-[#F5E6B3] hover:text-[#D4AF37] transition-colors text-sm">
                Nos Services
              </Link>
              <Link href={"/ecole" as never} className="text-[#F5E6B3] hover:text-[#D4AF37] transition-colors text-sm">
                École de Beauté
              </Link>
              <Link href={"/galerie" as never} className="text-[#F5E6B3] hover:text-[#D4AF37] transition-colors text-sm">
                Galerie
              </Link>
              <Link href={"/a-propos" as never} className="text-[#F5E6B3] hover:text-[#D4AF37] transition-colors text-sm">
                À propos
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-inter font-medium text-lg border-b border-gray-700 pb-2 w-max">
              Contact
            </h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 shrink-0 text-[#D4AF37]" />
                <span className="text-sm leading-tight">Ankadivato, Antananarivo<br/>Madagascar</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 shrink-0 text-[#D4AF37]" />
                <a href="tel:+261389293046" className="text-sm hover:text-[#D4AF37] transition-colors">
                  038 92 930 46
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MessageCircle className="w-5 h-5 shrink-0 text-[#D4AF37]" />
                <a 
                  href="https://wa.me/261389293046" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm hover:text-[#D4AF37] transition-colors"
                >
                  Message WhatsApp
                </a>
              </div>
            </div>
          </div>
          
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {currentYear} Blossome Institut de Beauté. Tous droits réservés.</p>
          <p className="mt-2 md:mt-0 flex items-center">
            Fait avec <span className="text-red-500 mx-1">♥</span> à Antananarivo
          </p>
        </div>
      </div>
    </footer>
  );
}
