# Blossome Project Context & Guidelines

Blossome is a premium beauty service booking platform (Coiffure, Esthétique, Onglerie, Maquillage) designed for the Malagasy market, featuring real-time availability and Mvola/Airtel Money payment integration.

## 🏗️ Architecture & Tech Stack

- **Framework:** Next.js 16.2.1 (App Router) + React 19 (Strict Mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Backend/Database:** Supabase (PostgreSQL, Auth, RLS)
- **Payments:** Mvola (Primary), Airtel Money
- **Communications:** Resend (Email), Africa's Talking (SMS placeholder)
- **Validation:** Zod + React Hook Form
- **Language:** TypeScript (Strict) / UI in French

## 🚀 Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- Supabase project with initial schema applied

### Local Development
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (Admin access for server actions)
   - `MVOLA_*` (API credentials and callback URL)
   - `RESEND_API_KEY`
3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
4. **Build for Production:**
   ```bash
   npm run build
   ```

## 🔐 Security & Data Integrity

- **Server-First Mutations:** All database writes must go through **Server Actions** (`lib/actions/`) or **API Routes**. Never perform direct Supabase writes from Client Components.
- **Input Validation:** Use `zod` schemas (defined in `lib/validation/`) for all user-provided data before processing.
- **Sanitization:** Strip HTML from user text fields before persisting to the database.
- **RLS:** Row Level Security is enabled in Supabase. Use the `createClient` (client-side) or `createServerSupabaseClient` (server-side) appropriately. Use `createAdminSupabaseClient` ONLY for system-level operations (like payment callbacks).
- **CSP:** Content Security Policy is configured in `next.config.ts`.

## 📅 Booking & Payment Flow

1. **Selection:** Service -> Staff/Date/Time -> Client Details.
2. **Pending State:** `createPendingBookingAction` creates a record with `status: pending_payment` and blocks the `availability_slots`.
3. **Payment Initiation:** `initiateMvolaPaymentAction` triggers the Mvola STK Push.
4. **Polling:** The client-side UI polls `/api/bookings/[id]/status` every 3 seconds.
5. **Confirmation:** The Mvola callback (`/api/mvola/callback`) updates the booking to `confirmed`.

### Testing Mvola
- Use `MVOLA_SANDBOX_BYPASS=true` in `.env` to auto-confirm bookings locally without hitting the real API.
- Use sandbox number `0343500003` for manual sandbox testing.

## 🎨 Frontend Conventions

- **Brand Colors:**
  - Cream: `#F5EDE3` (Backgrounds)
  - Brown: `#3D1F0D` (Headings)
  - Gold: `#C9A96E` (Accents/CTAs)
- **Fonts:** Cormorant Garamond (Serif/Headings) and Inter (Sans/Body).
- **Responsive Design:** Mobile-first approach. Use horizontal scroll with `snap-center` for card lists on mobile (e.g., `TestimonialsSection`).
- **Components:** Prefer Server Components. Use `'use client'` only when state or browser APIs are required.

## 📁 Key Directories

- `app/`: Next.js App Router (Routes, API endpoints)
- `components/`: UI components organized by feature (booking, home, layout, ui)
- `lib/`:
  - `actions/`: Server Actions for DB mutations
  - `supabase/`: Client, Server, and Admin Supabase instances
  - `mvola/`: Mvola API client and token management
  - `validation/`: Zod schemas
- `supabase/migrations/`: SQL schema definitions

## 📝 Development Notes

- **Timezone:** Fixed to `Africa/Nairobi` (UTC+3). Use `date-fns-tz` for all date formatting.
- **Images:** Always use Next.js `<Image />` component with descriptive `alt` text.
- **Commits:** Follow concise, "why"-focused commit messages.
