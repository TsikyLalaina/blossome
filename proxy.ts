import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Simple in-memory rate limiting for Edge
type RateLimitData = { count: number; expiresAt: number };
const rateLimiter = new Map<string, RateLimitData>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 seconds
  const maxRequests = 10;

  // Cleanup expired entries periodically (or on every check to keep memory low)
  for (const [key, data] of rateLimiter.entries()) {
    if (now > data.expiresAt) {
      rateLimiter.delete(key);
    }
  }

  const userRecord = rateLimiter.get(ip);
  if (!userRecord) {
    rateLimiter.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (now > userRecord.expiresAt) {
    rateLimiter.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (userRecord.count >= maxRequests) {
    return false;
  }

  userRecord.count++;
  return true;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Supabase Session Check for Admin / Account routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Verify user is admin
    const userRole = user.app_metadata?.user_role || user.user_metadata?.user_role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (path.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Security Headers
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // 3. Rate Limiting Guard
  if (request.method === 'POST') {
    const isRateLimitedPath = path.startsWith('/api/bookings') || path.startsWith('/api/enrolments') || path === '/api/contact';
    if (isRateLimitedPath) {
      // In Next.js App Router middleware, request.ip might be undefined if not behind a proxy that sets it. Fallback to header.
      // Next.js 15 removed request.ip entirely from NextRequest.
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      if (!rateLimit(ip)) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        });
      }
    }
  }

  // 4. Bot Protection
  const isBotProtectedPath = path === '/booking' || path.startsWith('/api/');
  if (isBotProtectedPath) {
    const ua = request.headers.get('user-agent')?.toLowerCase() || '';
    if (!ua || ua.includes('bot') || ua.includes('scraper') || ua.includes('crawler') || ua.includes('spider')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
