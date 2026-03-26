'use server';

import 'server-only';
import { Resend } from 'resend';
import { z } from 'zod/v4';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@blossomeinstitute.com';

/* ── Validation Schema ─────────────────────────────────────────────── */
const contactSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/),
  phone: z.string().optional(),
  email: z.string().email(),
  subject: z.enum(['rdv', 'formation', 'evenement', 'autre']),
  message: z.string().min(10).max(1000),
  honeypot: z.string().max(0).optional(), // must be empty
});

/* ── HTML strip utility ────────────────────────────────────────────── */
function stripHtml(text: string) {
  return text.replace(/<[^>]*>?/gm, '');
}

/* ── Subject labels ────────────────────────────────────────────────── */
const SUBJECT_LABELS: Record<string, string> = {
  rdv: 'Rendez-vous',
  formation: 'Formation',
  evenement: 'Événement',
  autre: 'Autre',
};

/* ── Server Action ─────────────────────────────────────────────────── */
export async function sendContactMessageAction(
  data: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données du formulaire invalides.' };
  }

  const { name, phone, email, subject, message, honeypot } = parsed.data;

  // 2. Honeypot check — silently succeed if bot detected
  if (honeypot && honeypot.length > 0) {
    return { success: true };
  }

  // 3. Sanitize
  const safeName = stripHtml(name);
  const safeMessage = stripHtml(message);
  const subjectLabel = SUBJECT_LABELS[subject] || subject;

  try {
    // 4. Send notification to admin
    await resend.emails.send({
      from: 'Blossome <noreply@blossomeinstitute.com>',
      to: ADMIN_EMAIL,
      subject: `Nouveau message — ${subjectLabel} | ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1A0E07; max-width: 600px; margin: 0 auto; border: 1px solid #D4C4B0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #3D1F0D; padding: 24px; text-align: center;">
            <h1 style="color: #F5EDE3; margin: 0; font-size: 20px;">Nouveau Message de Contact</h1>
          </div>
          <div style="padding: 24px; background: #FFFFFF;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Nom</td>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Téléphone</td>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0;">${phone || 'Non fourni'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Sujet</td>
                <td style="padding: 10px; border-bottom: 1px solid #D4C4B0;">${subjectLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #3D1F0D;" colspan="2">Message</td>
              </tr>
              <tr>
                <td style="padding: 10px; white-space: pre-line;" colspan="2">${safeMessage}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #F5EDE3; padding: 16px; text-align: center;">
            <p style="margin: 0; color: #6B3A2A; font-size: 12px;">Blossome Institut de Beauté — Message de contact</p>
          </div>
        </div>
      `,
    });

    // 5. Send auto-reply to sender
    await resend.emails.send({
      from: 'Blossome <noreply@blossomeinstitute.com>',
      to: email,
      subject: 'Merci pour votre message — Blossome Institut de Beauté',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1A0E07; max-width: 600px; margin: 0 auto; border: 1px solid #D4C4B0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #3D1F0D; padding: 24px; text-align: center;">
            <h1 style="color: #F5EDE3; margin: 0; font-size: 24px; font-style: italic;">BLOSSOME</h1>
            <p style="color: #C9A96E; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 2px;">INSTITUT DE BEAUTÉ</p>
          </div>
          <div style="padding: 32px 24px; background-color: #FFFFFF;">
            <h2 style="color: #6B3A2A; margin-top: 0;">Merci ${safeName} ! 💛</h2>
            <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
            <p style="color: #6B3A2A; font-size: 14px;">En attendant, n'hésitez pas à nous contacter directement :</p>
            <div style="background-color: #F5EDE3; padding: 16px; border-radius: 8px; margin-top: 16px;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #3D1F0D;">📱 Téléphone</p>
              <p style="margin: 0; color: #6B3A2A;">038 92 930 46</p>
              <p style="margin: 12px 0 8px 0; font-weight: bold; color: #3D1F0D;">📍 Adresse</p>
              <p style="margin: 0; color: #6B3A2A;">Ankadivato, Antananarivo, Madagascar</p>
            </div>
          </div>
          <div style="background-color: #F5EDE3; padding: 24px; text-align: center; border-top: 1px solid #D4C4B0;">
            <p style="margin: 0; color: #6B3A2A; font-size: 12px;">© ${new Date().getFullYear()} Blossome Institut de Beauté. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Contact email error:', error);
    return { success: false, error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' };
  }
}
