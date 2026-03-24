@AGENTS.md

# Blossome Project Context

## Stack

- Next.js 16.2.1 (App Router, Turbopack default), TypeScript strict mode, React 19.2
- Supabase (PostgreSQL + Auth + Storage + RLS + Edge Functions)
- Tailwind CSS v4 + shadcn/ui
- Resend (email), Africa's Talking (SMS), Mvola + Airtel Money (payments)

## Caching Strategy (Next.js 16 opt-in model)

- "use cache" directive on stable data: service catalogue, staff, courses
- No cache (default, request-time) on: booking availability, user-specific data, admin pages
- revalidate tags: 'services', 'staff', 'courses', 'gallery'
- Cache invalidated by admin actions via revalidateTag()

## Security Rules

- NEVER trust client-side auth checks alone — all mutations go through server actions or API routes with server-side Supabase session verification
- All API routes validate input with zod before any DB operation
- CSRF: Next.js Server Actions have built-in CSRF protection — prefer them over raw POST endpoints
- Rate limiting on all public POST routes (contact, booking create, enrolment)
- No secrets in client components or public env vars except NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Content Security Policy headers set in next.config.ts
- Input sanitization: strip HTML from all user text fields before DB write

## Brand Colors

- cream: #F5EDE3 (bg-blossome-cream) — page backgrounds
- brown: #3D1F0D (text-blossome-brown) — H1/H2 headings
- mid: #6B3A2A (text-blossome-mid) — body text
- gold: #C9A96E (text-blossome-gold) — CTAs, accents, borders
- gold-lt: #EDD9B4 (bg-blossome-gold-lt) — card highlights
- taupe: #D4C4B0 (border-blossome-taupe) — dividers, inputs
- dark: #1A0E07 (text-blossome-dark) — footer

## Fonts

- Cormorant Garamond (serif) — headings, display, taglines
- Inter (sans-serif) — body, labels, UI

## Supabase

- URL: https://idrsvqbdutyfchsphgup.supabase.co
- Timezone: Africa/Nairobi (UTC+3) — always use date-fns-tz for display

## SSR / SEO Rules

- All public pages: Server Components by default, no 'use client' unless interactivity required
- generateMetadata() on every page — never skip
- JSON-LD structured data on every page (LocalBusiness base + page-specific type)
- All images: Next.js <Image> with alt text following pattern "[service/item name] Antananarivo"
- Open Graph + Twitter Card tags on all pages
- Canonical URLs always set

## UI Language

- French (all UI copy), TypeScript strict, no `any`

## DB Tables

services, staff, availability_slots, bookings, school_courses, enrolments, profiles
