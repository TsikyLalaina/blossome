import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://blossomeinstitute.com'),
  title: { template: '%s | Blossome Institut de Beauté', default: 'Blossome Institut de Beauté de Luxe | Antananarivo' },
  description: 'Institut de beauté de luxe à Antananarivo...',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MG',
    url: 'https://blossomeinstitute.com',
    siteName: 'Blossome Institut de Beauté',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://blossomeinstitute.com' }
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "BeautySalon"],
  "name": "Blossome Institut de Beauté",
  "url": "https://blossomeinstitute.com",
  "telephone": "+261389293046",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ankadivato",
    "addressLocality": "Antananarivo",
    "addressCountry": "MG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -18.9101,
    "longitude": 47.5312
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "MGA 15000–300000",
  "image": "https://blossomeinstitute.com/og-default.jpg",
  "sameAs": [
    "https://www.facebook.com/blossomeinstitut",
    "https://www.instagram.com/blossome_mdg"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", cormorant.variable, inter.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-black">
          Aller au contenu principal
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <Toaster />
      </body>
    </html>
  );
}
