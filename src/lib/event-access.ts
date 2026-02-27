import { NextRequest } from 'next/server';
import { createClient, createServiceClient } from './supabase/server';

export interface EventAccess {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any;
  isGuest: boolean;
}

/**
 * Parse the gi_event_access cookie for a specific event ID.
 * Cookie format: "{eventId}:{accessToken}"
 */
export function getTokenFromCookie(request: NextRequest, eventId: string): string | null {
  const cookieVal = request.cookies.get('gi_event_access')?.value;
  if (!cookieVal) return null;
  const colonIdx = cookieVal.indexOf(':');
  if (colonIdx === -1) return null;
  const cookieId = cookieVal.slice(0, colonIdx);
  const cookieToken = cookieVal.slice(colonIdx + 1);
  return cookieId === eventId && cookieToken ? cookieToken : null;
}

/**
 * Authorize access to an event.
 * Checks user session first (ownership by user_id), then falls back to
 * the access_token cookie for anonymous/guest sessions.
 * Returns { event, isGuest } or null if unauthorized.
 */
export async function authorizeEventAccess(
  eventId: string,
  request: NextRequest
): Promise<EventAccess | null> {
  const serviceClient = createServiceClient();

  // 1. Try authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: event } = await serviceClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();
    if (event) return { event, isGuest: false };
  }

  // 2. Fall back to access_token cookie
  const token = getTokenFromCookie(request, eventId);
  if (token) {
    const { data: event } = await serviceClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('access_token', token)
      .is('user_id', null)
      .single();
    if (event) return { event, isGuest: true };
  }

  return null;
}
