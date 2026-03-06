'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { EventType, FullEventData } from '@/types';
import { getDefaultTheme } from '@/lib/themes';
import * as guestStore from '@/lib/guestStore';
import GuestDashboardClient from '@/components/dashboard/GuestDashboardClient';
import { Loader2 } from 'lucide-react';

function GuestDashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<FullEventData | null>(null);

  useEffect(() => {
    const type = searchParams.get('type') as EventType | null;
    const name = decodeURIComponent(searchParams.get('name') || '');
    const date = decodeURIComponent(searchParams.get('date') || '');

    if (!type || !name) {
      router.replace('/order');
      return;
    }

    // Load or initialize guest meta
    let meta = guestStore.loadMeta();
    if (!meta || meta.eventType !== type || meta.eventName !== name) {
      meta = {
        eventType: type,
        eventName: name,
        eventDate: date,
        details: {},
        themeId: null,
      };
      guestStore.saveMeta(meta);
    }

    const defaultTheme = getDefaultTheme(type);

    const data: FullEventData = {
      event: {
        id: 'guest',
        slug: 'guest',
        event_type: type,
        event_name: meta.eventName,
        event_date: meta.eventDate || date || null,
        status: 'active',
        client_name: '',
        client_email: '',
        access_token: '',
        user_id: null,
        stripe_checkout_session_id: null,
        stripe_payment_intent_id: null,
        theme_id: meta.themeId || defaultTheme?.id || null,
        theme_premium_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      details: Object.entries(meta.details).map(([key, value], i) => ({
        id: String(i),
        event_id: 'guest',
        detail_key: key,
        detail_value: value,
        created_at: new Date().toISOString(),
      })),
      photos: [],
      music: [],
      rsvps: [],
    };

    setInitialData(data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return <GuestDashboardClient initialData={initialData} />;
}

export default function GuestDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <GuestDashboardInner />
    </Suspense>
  );
}
