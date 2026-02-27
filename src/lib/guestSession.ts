const GUEST_KEY = 'guestEventSession';

export interface GuestSession {
  type: string;
  name: string;
  date: string;
  details: Record<string, string>;
  themeId: string | null;
}

export function loadGuestSession(): GuestSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGuestSession(data: GuestSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(data));
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_KEY);
}
