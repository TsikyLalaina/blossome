'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'École de Beauté', href: '/ecole' },
  { name: 'Galerie', href: '/galerie' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-blossome-taupe">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={"/" as never}
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blossome-gold rounded hover:opacity-90 transition-opacity"
          aria-label="Accueil — Blossome Institut de Beauté"
        >
          <Image
            src="/logo.png"
            alt="Blossome Institut de Beauté Antananarivo"
            width={140}
            height={44}
            priority
            className="h-10 w-auto"
          />
          <span className="sr-only">Blossome Institut de Beauté</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href as never}
                aria-current={isActive ? 'page' : undefined}
                className={`font-inter text-sm font-medium transition-colors hover:text-blossome-gold ${
                  isActive ? 'text-blossome-gold border-b-2 border-blossome-gold pb-1' : 'text-blossome-dark'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href={"/booking" as never}
            className="inline-flex items-center justify-center px-6 py-2.5 font-inter text-sm font-medium text-white bg-blossome-gold rounded hover:bg-blossome-brown transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blossome-gold"
          >
            Réserver
          </Link>
        </div>

        {/* Mobile Navigation (Sheet) */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="p-2 -mr-2 text-blossome-dark hover:text-blossome-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blossome-gold rounded"
              aria-label="Ouvrir le menu principal"
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white border-l border-blossome-taupe">
              <SheetHeader className="text-center mt-6 mb-8">
                <SheetTitle className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Blossome Institut de Beauté Antananarivo"
                    width={140}
                    height={44}
                    className="h-10 w-auto"
                  />
                  <span className="sr-only">Blossome Institut de Beauté</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-6 items-center">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href as never}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`inline-flex w-full justify-center px-6 font-inter text-lg text-center transition-colors hover:text-blossome-gold ${
                        isActive ? 'text-blossome-gold font-medium' : 'text-blossome-dark'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-6 border-t border-blossome-taupe flex flex-col items-center">
                  <Link
                    href={"/booking" as never}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center w-full px-6 py-3 font-inter text-base font-medium text-white bg-blossome-gold rounded hover:bg-blossome-brown transition-colors"
                  >
                    Réserver
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
