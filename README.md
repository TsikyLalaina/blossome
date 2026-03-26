# Blossome - Booking Platform (Next.js + Supabase + MVOLA)

Blossome is a web application for booking beauty services (coiffure, esthetique, onglerie, maquillage) with online payment via MVOLA.

## Tech Stack

- Next.js 16.2.1 (App Router), React 19, TypeScript strict mode
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Resend (email)
- MVOLA (Mvola sandbox/prod) + Airtel Money (payments)

Key conventions in this codebase:
- Server-side mutations go through Server Actions or API routes (not client-side auth checks).
- Input validation with `zod` before any DB operation.
- Content Security Policy (CSP) set in `next.config.ts`.

## Local Setup

1. Install dependencies:

```bash
npm ci
```

2. Configure environment variables.

This project uses:
- Public Supabase client for browser reads
- Server Supabase admin key for writes / payment callbacks
- MVOLA credentials for payment initiation + callback validation
- Resend API key for email confirmations

At minimum, set:

```bash
# Supabase (client/browser)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Supabase (server/admin)
SUPABASE_SERVICE_KEY=...

# MVOLA
MVOLA_BASE_URL=...
MVOLA_TOKEN_URL=...
MVOLA_CLIENT_ID=...
MVOLA_CLIENT_SECRET=...
MVOLA_PARTNER_MSISDN=...
MVOLA_PARTNER_NAME=...

# Public callback endpoint (should point to your deployed site)
MVOLA_CALLBACK_URL=https://<your-domain>/api/mvola/callback

# Email
RESEND_API_KEY=...
```

3. Create/update DB schema using the Supabase migrations in `supabase/migrations/`.

4. Run the app:

```bash
npm run dev
```

Then open: `http://localhost:3000`

## MVOLA Payment Flow

1. User selects service + date/time (Step 1-2), enters details (Step 3).
2. On Step 4 (payment), the app creates a pending booking (`status = pending_payment`) and starts MVOLA payment.
   - Pending booking creation: `lib/actions/bookings.ts` (`createPendingBookingAction`)
   - Payment initiation: `lib/mvola/mvolaClient.ts` (`initiateMvolaPayment`)
3. While waiting, the UI polls booking status:
   - Poll endpoint: `app/api/bookings/[id]/status/route.ts`
   - Poll interval: every ~3 seconds (`components/booking/Step4Payment.tsx`)
4. When MVOLA calls the callback, the app updates the booking to confirmed:
   - Callback endpoint: `app/api/mvola/callback/route.ts`

### Testing on MVOLA Sandbox

1. In the booking flow, enter `0343500003` as the client phone number.
2. Complete the booking until Step 4 creates a pending transaction.
3. Open: [developer.mvola.mg](https://developer.mvola.mg/) -> "Transaction Approvals".
4. Approve the pending transaction.
5. The booking status should update to `confirmed` in the next poll cycle.

## Vercel Deployment Notes

- Ensure `MVOLA_CALLBACK_URL` is configured in Vercel env vars (must match the URL configured in the MVOLA dev portal).
- If you change files in `public/` but keep the same filename, Next's image optimizer can serve cached optimized variants per breakpoint; rename the file to cache-bust if needed.

## Where to Look in the Code

- Booking wizard UI:
  - `components/booking/BookingWizard.tsx`
  - `components/booking/Step2DateTime.tsx`
  - `components/booking/Step3ClientDetails.tsx`
  - `components/booking/Step4Payment.tsx`
  - `components/booking/Step5Confirmation.tsx`
- MVOLA callback:
  - `app/api/mvola/callback/route.ts`
- Booking status polling:
  - `app/api/bookings/[id]/status/route.ts`
