'use client';

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Link from 'next/link';

export function WhatsAppButton() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        href="https://wa.me/261389293046?text=Bonjour%20Blossome%2C%20j%27aimerais%20avoir%20plus%20d%27informations"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Blossome sur WhatsApp"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      >
        <Phone className="w-6 h-6 fill-current" />
      </Link>
    </motion.div>
  );
}
