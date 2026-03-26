import { z } from 'zod';

/* ── Step 1: Service Selection ───────────────────────────── */
export const serviceSelectionSchema = z.object({
  serviceId: z.string().uuid(),
});

/* ── Step 2: Date & Time ─────────────────────────────────── */
export const dateTimeSchema = z.object({
  // The UI already blocks past dates, so we just ensure it's a Date object.
  // We avoid .min() because Date from DayPicker is at 00:00, which can fail .min(new Date()) for today.
  date: z.coerce.date(),
  slotId: z.string().uuid(),
  slotStart: z.string().datetime({ offset: true }),
  slotEnd: z.string().datetime({ offset: true }),
  staffId: z.string().uuid().optional(),
});

/* ── Step 3: Client Details ──────────────────────────────── */
export const clientDetailsSchema = z.object({
  clientName: z
    .string()
    .min(2, 'Nom requis')
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom invalide'),
  clientPhone: z
    .string()
    .regex(/^0[23]\d \d{2} \d{3} \d{2}$/, 'Format: 03X XX XXX XX'),
  clientEmail: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(300, 'Max 300 caractères')
    .optional(),
});

/* ── Step 4: Payment ─────────────────────────────────────── */
export const paymentSchema = z.object({
  paymentMethod: z.enum(['mvola', 'airtel_money']),
  paymentRef: z
    .string()
    .min(8, 'Référence trop courte')
    .max(30)
    .regex(/^[A-Z0-9\-]+$/i, 'Référence invalide'),
});

/* ── Combined booking selections type ────────────────────── */
export type ServiceSelection = z.infer<typeof serviceSelectionSchema>;
export type DateTimeSelection = z.infer<typeof dateTimeSchema>;
export type ClientDetails = z.infer<typeof clientDetailsSchema>;
export type PaymentDetails = z.infer<typeof paymentSchema>;

export const bookingCreateSchema = z.object({
  service: serviceSelectionSchema,
  dateTime: dateTimeSchema,
  client: clientDetailsSchema,
  payment: paymentSchema,
});

export interface BookingSelections {
  service: Partial<ServiceSelection>;
  dateTime: Partial<DateTimeSelection>;
  client: Partial<ClientDetails>;
  payment: Partial<PaymentDetails>;
}

export const initialBookingSelections: BookingSelections = {
  service: {},
  dateTime: {},
  client: {},
  payment: {},
};
