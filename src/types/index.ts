export type EventType = 'sweet15' | 'wedding' | 'birthday' | 'baby_shower' | 'valentines' | 'mothers_day' | 'fathers_day';
export type EventStatus = 'pending' | 'paid' | 'active' | 'published';

export interface Event {
  id: string;
  slug: string;
  event_type: EventType;
  event_name: string;
  event_date: string | null;
  status: EventStatus;
  client_name: string;
  client_email: string;
  access_token: string;
  user_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  theme_id: string | null;
  theme_premium_paid: boolean;
  created_at: string;
  updated_at: string;
}

export type ThemeLayout = 'classic' | 'split' | 'minimal';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  hero: string;
  heroText: string;
}

export interface ThemeVariant {
  id: string;
  name: string;
  description: string;
  eventType: EventType;
  isPremium: boolean;
  layout: ThemeLayout;
  colors: ThemeColors;
}

export interface EventDetail {
  id: string;
  event_id: string;
  detail_key: string;
  detail_value: string | null;
  created_at: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  is_hero: boolean;
  created_at: string;
}

export interface EventMusic {
  id: string;
  event_id: string;
  storage_path: string | null;
  song_title: string | null;
  artist: string | null;
  source: 'upload' | 'spotify';
  spotify_track_id: string | null;
  created_at: string;
}

export interface RSVP {
  id: string;
  event_id: string;
  guest_name: string;
  attending: boolean;
  guest_count: number;
  message: string | null;
  song_request?: string | null;
  created_at: string;
}

export interface EventTypeConfig {
  type: EventType;
  label: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  fields: EventFieldConfig[];
}

export interface EventFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'url' | 'address';
  placeholder?: string;
  required?: boolean;
}

export interface FullEventData {
  event: Event;
  details: EventDetail[];
  photos: EventPhoto[];
  music: EventMusic[];
  rsvps: RSVP[];
}
