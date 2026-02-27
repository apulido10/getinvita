import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getEventAccessToken(request: NextRequest, eventId: string): string | null {
  const cookieVal = request.cookies.get('gi_event_access')?.value;
  if (!cookieVal) return null;
  const colonIdx = cookieVal.indexOf(':');
  if (colonIdx === -1) return null;
  const cookieId = cookieVal.slice(0, colonIdx);
  const cookieToken = cookieVal.slice(colonIdx + 1);
  return cookieId === eventId && cookieToken ? cookieToken : null;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (important for keeping cookies valid)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // /dashboard/[eventId] — allow if logged in OR has a matching event access cookie
  if (pathname.startsWith('/dashboard/')) {
    if (!user) {
      const eventId = pathname.split('/')[2];
      if (eventId && getEventAccessToken(request, eventId)) {
        // Cookie present — let the page handler do the full validation
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  } else if (pathname === '/dashboard') {
    // Top-level dashboard list requires auth
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // /api/events/[id]/* — allow if logged in OR has a matching event access cookie
  if (pathname.startsWith('/api/events/') && !user) {
    const segments = pathname.split('/');
    const eventId = segments[3]; // /api/events/{id}/...
    if (eventId && getEventAccessToken(request, eventId)) {
      return supabaseResponse;
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // /api/checkout — allow unauthenticated (anonymous event creation)
  // No block needed here — the route itself handles the logic.

  // Help crawlers and clients detect language by route prefix.
  const contentLanguage = pathname.startsWith('/es') ? 'es-US' : 'en-US';
  supabaseResponse.headers.set('Content-Language', contentLanguage);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - /events/[slug] (public event pages) — handled by allowing through
     * - /api/rsvp (public endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/rsvp).*)',
  ],
};
