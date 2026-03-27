import 'server-only';
import { Resend } from 'resend';
import { formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import type { Booking, Service } from '@/lib/types'; // Assuming types defined in lib/types.ts

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const TIMEZONE = 'Africa/Nairobi';

export async function sendBookingConfirmationEmail(
  booking: Booking & { 
    client_email?: string;
    availability_slots?: { slot_start: string; slot_end: string };
  }, 
  service: Service
) {
  // We only send if there is an email linked to the profile or booking
  // Currently, the prompt doesn't specify an email field in Booking, 
  // so we might need to assume we pass a user email directly, or it's fetched.
  // We'll accept it via a parameter or fetch it.
  
  // Provided prompt: "Only called if client_email is present" 
  // Let's assume booking object has it, or we pass it separately?
  // Wait, the prompt says `sendBookingConfirmationEmail(booking: Booking, service: Service)`.
  // If `Booking` interface doesn't have `client_email`, we will just check `booking.client_email` dynamically, 
  // or fetch from `profiles`. Let's assume there's a way.
  
  // The prompt says "subject: Confirmation RDV Blossome — [service.name] le [date]"
  
  try {
    if (!booking.availability_slots) {
      throw new Error("Availability slots missing from booking object");
    }

    const { slot_start, slot_end } = booking.availability_slots;
    const formattedDate = formatInTimeZone(slot_start, TIMEZONE, 'EEEE d MMMM yyyy', { locale: fr });
    const formattedStart = formatInTimeZone(slot_start, TIMEZONE, 'HH:mm');
    const formattedEnd = formatInTimeZone(slot_end, TIMEZONE, 'HH:mm');

    // Fetch the extended client_email property via string literal
    const clientEmail = booking['client_email'];
    if (!clientEmail) return;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1A0E07; max-width: 600px; margin: 0 auto; border: 1px solid #D4C4B0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3D1F0D; padding: 24px; text-align: center;">
          <h1 style="color: #F5EDE3; margin: 0; font-size: 24px; font-style: italic;">BLOSSOME</h1>
          <p style="color: #C9A96E; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 2px;">INSTITUT DE BEAUTÉ</p>
        </div>
        
        <div style="padding: 32px 24px; background-color: #FFFFFF;">
          <h2 style="color: #6B3A2A; margin-top: 0;">Rendez-vous Confirmé 🎉</h2>
          <p>Bonjour,</p>
          <p>Votre réservation a bien été confirmée. Voici le récapitulatif de votre rendez-vous :</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Service</td>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; text-align: right;">${service.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Date</td>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; font-weight: bold; color: #3D1F0D;">Heure</td>
              <td style="padding: 12px; border-bottom: 1px solid #D4C4B0; text-align: right;">${formattedStart} - ${formattedEnd}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #3D1F0D;">Référence</td>
              <td style="padding: 12px; text-align: right; color: #C9A96E; font-family: monospace; font-size: 16px;">BLS-${booking.id.slice(0, 8).toUpperCase()}</td>
            </tr>
          </table>

          <div style="background-color: #F5EDE3; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #3D1F0D;">📍 Notre Adresse</p>
            <p style="margin: 0; color: #6B3A2A;">12 Rue de l'Institut, Ankadivato<br/>Antananarivo 101, Madagascar</p>
            <a href="https://maps.google.com/?q=Ankadivato+Antananarivo" style="display: inline-block; margin-top: 12px; color: #C9A96E; text-decoration: none; font-weight: bold;">Voir sur Google Maps &rarr;</a>
          </div>

          <p style="color: #6B3A2A; font-size: 14px;">Pour toute modification ou annulation, veuillez nous contacter au moins 24h à l'avance.</p>
        </div>

        <div style="background-color: #F5EDE3; padding: 24px; text-align: center; border-top: 1px solid #D4C4B0;">
          <p style="margin: 0; color: #6B3A2A; font-size: 12px;">© ${new Date().getFullYear()} Blossome Institut de Beauté. Tous droits réservés.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Blossome <noreply@blossomeinstitute.com>',
      to: clientEmail,
      subject: `Confirmation RDV Blossome — ${service.name} le ${formattedDate}`,
      html: htmlContent,
    });
    
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Silent fail so booking succeeds even if email drops
  }
}
