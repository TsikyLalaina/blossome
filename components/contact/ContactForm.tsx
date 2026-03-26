'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useState } from 'react';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { sendContactMessageAction } from '@/lib/actions/contact';

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères non autorisés'),
  phone: z.string().optional(),
  email: z.string().email('Adresse email invalide'),
  subject: z.enum(['rdv', 'formation', 'evenement', 'autre']),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message est trop long'),
  honeypot: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const SUBJECTS = [
  { value: 'rdv', label: 'Rendez-vous' },
  { value: 'formation', label: 'Formation' },
  { value: 'evenement', label: 'Événement' },
  { value: 'autre', label: 'Autre' },
] as const;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: 'rdv',
      message: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const result = await sendContactMessageAction(data);

      if (result.success) {
        toast.success('Message envoyé !', {
          description: 'Nous vous répondrons dans les plus brefs délais.',
        });
        reset();
      } else {
        toast.error('Erreur', {
          description: result.error || 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur réseau est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-blossome-cream" aria-label="Formulaire de contact">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-cormorant italic text-blossome-gold text-lg mb-2">
              Écrivez-nous
            </p>
            <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-blossome-brown">
              Formulaire de Contact
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-blossome-taupe/10 space-y-6"
            noValidate
          >
            {/* Honeypot — hidden from humans */}
            <div className="contact-hp" aria-hidden="true">
              <label htmlFor="contact-hp-field">
                Ne pas remplir
                <input
                  id="contact-hp-field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register('honeypot')}
                />
              </label>
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-blossome-brown mb-1.5">
                Nom <span className="text-destructive">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Votre nom complet"
                className="w-full px-4 py-3 rounded-xl border border-blossome-taupe/30 bg-blossome-cream/30 text-blossome-dark text-sm placeholder:text-blossome-taupe focus:border-blossome-gold focus:ring-2 focus:ring-blossome-gold/20 outline-none transition-all"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-blossome-brown mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-blossome-taupe/30 bg-blossome-cream/30 text-blossome-dark text-sm placeholder:text-blossome-taupe focus:border-blossome-gold focus:ring-2 focus:ring-blossome-gold/20 outline-none transition-all"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-blossome-brown mb-1.5">
                  Téléphone
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="038 00 000 00"
                  className="w-full px-4 py-3 rounded-xl border border-blossome-taupe/30 bg-blossome-cream/30 text-blossome-dark text-sm placeholder:text-blossome-taupe focus:border-blossome-gold focus:ring-2 focus:ring-blossome-gold/20 outline-none transition-all"
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-blossome-brown mb-1.5">
                Sujet <span className="text-destructive">*</span>
              </label>
              <select
                id="contact-subject"
                className="w-full px-4 py-3 rounded-xl border border-blossome-taupe/30 bg-blossome-cream/30 text-blossome-dark text-sm focus:border-blossome-gold focus:ring-2 focus:ring-blossome-gold/20 outline-none transition-all"
                {...register('subject')}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-blossome-brown mb-1.5">
                Message <span className="text-destructive">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Décrivez votre demande..."
                className="w-full px-4 py-3 rounded-xl border border-blossome-taupe/30 bg-blossome-cream/30 text-blossome-dark text-sm placeholder:text-blossome-taupe focus:border-blossome-gold focus:ring-2 focus:ring-blossome-gold/20 outline-none transition-all resize-none"
                {...register('message')}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blossome-brown text-white font-medium rounded-xl hover:bg-blossome-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
