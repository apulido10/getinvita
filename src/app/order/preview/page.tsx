'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FullEventData, EventType } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { getDefaultTheme } from '@/lib/themes';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import WeddingTemplate from '@/components/templates/WeddingTemplate';
import Sweet15Template from '@/components/templates/Sweet15Template';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import BabyShowerTemplate from '@/components/templates/BabyShowerTemplate';

// ─── Mock data builders ────────────────────────────────────────────────────────

function makeDetail(key: string, value: string, idx: number): FullEventData['details'][0] {
  return {
    id: String(idx),
    event_id: 'preview-id',
    detail_key: key,
    detail_value: value,
    created_at: new Date().toISOString(),
  };
}

function getSampleDetails(type: EventType, name: string): FullEventData['details'] {
  const entries: [string, string][] = [];

  switch (type) {
    case 'wedding': {
      const parts = name.split(/\s*&\s*/);
      entries.push(
        ['partner1_name', parts[0]?.trim() || 'Sarah'],
        ['partner2_name', parts[1]?.trim() || 'Michael'],
        ['venue_name', 'The Grand Estate'],
        ['venue_address', '1234 Celebration Ave, Los Angeles, CA 90001'],
        ['ceremony_time', '16:00'],
        ['reception_start', '18:00'],
        ['our_story', "We met at a coffee shop on a rainy Tuesday — and the rest, as they say, is history. Three years, countless adventures, and one unforgettable proposal later, we can't wait to celebrate with everyone we love."],
        ['dress_code', 'Black Tie Optional'],
        ['special_message', 'We are so grateful to have you as part of our special day. Your presence is the greatest gift of all.'],
      );
      break;
    }
    case 'sweet15': {
      const honoree = name.replace(/[''`]s?\s*(quincea[ñn]era|sweet\s*15)/i, '').trim() || 'Isabella';
      entries.push(
        ['honoree_name', honoree],
        ['venue_name', 'Grand Ballroom at The Palace'],
        ['venue_address', '1234 Celebration Ave, Los Angeles, CA 90001'],
        ['ceremony_time', '16:00'],
        ['reception_start', '18:00'],
        ['theme', 'Enchanted Rose Garden'],
        ['dress_code', 'Formal / Semi-formal'],
        ['parent_names', 'Maria & Carlos Garcia'],
        ['court_of_honor', 'Sophia R. · Valentina M. · Isabella C. · Diego H. · Carlos P.'],
        ['special_message', 'Tonight we celebrate a girl who has grown into a remarkable young woman. Thank you for joining us on this magical evening.'],
      );
      break;
    }
    case 'birthday': {
      const person = name.replace(/[''`]s?\s*birthday.*/i, '').trim() || 'Sophia';
      entries.push(
        ['birthday_person', person],
        ['turning_age', '30'],
        ['venue_name', 'The Rooftop Lounge'],
        ['venue_address', '5678 Celebration Blvd, Miami, FL 33101'],
        ['party_time', '19:00'],
        ['theme', 'Tropical Paradise'],
        ['dress_code', 'Casual Chic'],
        ['special_message', "Life is a party — and you're invited! Come celebrate another trip around the sun with great food, great music, and even greater company."],
      );
      break;
    }
    case 'baby_shower': {
      const parents = name.replace(/baby shower/i, '').trim() || 'The Johnsons';
      entries.push(
        ['parent_names', parents],
        ['shower_time', '13:00'],
        ['theme', 'Woodland Animals'],
        ['special_message', "We're over the moon excited to welcome our little one! Please join us for an afternoon of celebration, laughter, and love."],
      );
      break;
    }
    case 'valentines':
    case 'mothers_day':
    case 'fathers_day':
      entries.push(
        ['birthday_person', name || 'You'],
        ['special_message', "Today and every day, you make the world a more beautiful place. This is for you — with all the love in the world."],
      );
      break;
  }

  return entries.map(([key, value], idx) => makeDetail(key, value, idx));
}

function buildMockData(type: EventType, name: string, date: string): FullEventData {
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);

  return {
    event: {
      id: 'preview-id',
      slug: 'preview',
      event_type: type,
      event_name: name,
      event_date: date || defaultDate.toISOString(),
      status: 'active',
      client_name: '',
      client_email: '',
      access_token: '',
      user_id: null,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      theme_id: null,
      theme_premium_paid: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    details: getSampleDetails(type, name),
    photos: [],
    music: [],
    rsvps: [
      { id: 'r1', event_id: 'preview-id', guest_name: 'Maria G.', attending: true, guest_count: 2, message: 'So excited! Counting down the days!', created_at: new Date().toISOString() },
      { id: 'r2', event_id: 'preview-id', guest_name: 'James & Ana', attending: true, guest_count: 2, message: "Wouldn't miss it for the world!", created_at: new Date().toISOString() },
    ],
  };
}

// ─── Preview page ──────────────────────────────────────────────────────────────

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') as EventType | null;
  const name = decodeURIComponent(searchParams.get('name') || '');
  const date = decodeURIComponent(searchParams.get('date') || '');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const config = type ? getEventTypeConfig(type) : null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  if (!type || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Invalid event type.{' '}
          <Link href="/order" className="text-purple-600 underline">
            Go back
          </Link>
        </p>
      </div>
    );
  }

  const mockData = buildMockData(type, name, date);
  const theme = getDefaultTheme(type);

  const TemplateComponent =
    type === 'wedding'
      ? WeddingTemplate
      : type === 'sweet15'
      ? Sweet15Template
      : type === 'baby_shower'
      ? BabyShowerTemplate
      : BirthdayTemplate;

  const editUrl = `/order?type=${type}&name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(
    `/order/preview?type=${type}&name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`
  )}`;

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: type,
          event_name: name,
          event_date: date || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        setError(data.error || 'Something went wrong.');
        setSaving(false);
      }
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Back */}
          <Link
            href={editUrl}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>

          {/* Center label */}
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="text-sm text-gray-500 truncate">
              <span className="hidden sm:inline">Preview — </span>add photos, music &amp; more after saving
            </span>
          </div>

          {/* CTA */}
          <div className="shrink-0 flex items-center gap-3">
            {error && <p className="text-xs text-red-600 hidden sm:block">{error}</p>}
            {isLoggedIn === null ? (
              <div className="h-9 w-44 rounded-lg bg-gray-100 animate-pulse" />
            ) : isLoggedIn ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-purple-600 text-white px-5 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : `Save My Site — $${(config.price / 100).toFixed(0)}`}
              </button>
            ) : (
              <Link
                href={loginUrl}
                className="flex items-center gap-2 rounded-lg bg-purple-600 text-white px-5 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
              >
                Create Account to Save — ${(config.price / 100).toFixed(0)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
        Preview — sample photos shown. Upload your own after saving your site.
      </div>

      {/* Live template */}
      <TemplateComponent data={mockData} supabaseUrl={supabaseUrl} theme={theme} lang="en" />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
