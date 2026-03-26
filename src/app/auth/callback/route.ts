import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  // Check query param first, then cookie fallback
  const cookieRedirect = request.cookies.get('auth_redirect')?.value;
  const redirect = searchParams.get('redirect') || (cookieRedirect ? decodeURIComponent(cookieRedirect) : null) || '/dashboard';

  if (code) {
    const redirectUrl = new URL(redirect, origin);
    const isRecovery = redirect.startsWith('/auth/reset-password');
    const type = searchParams.get('type');
    if (!isRecovery && type === 'signup') redirectUrl.searchParams.set('confirmed', 'true');
    const supabaseResponse = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Clear the redirect cookie
      supabaseResponse.cookies.set('auth_redirect', '', { path: '/', maxAge: 0 });
      return supabaseResponse;
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
}
