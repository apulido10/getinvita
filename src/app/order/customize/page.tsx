'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EventType } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import GuestDashboardClient from '@/components/dashboard/GuestDashboardClient';

function CustomizeContent() {
  const searchParams = useSearchParams();

  const type = searchParams.get('type') as EventType | null;
  const name = decodeURIComponent(searchParams.get('name') || '');
  const date = decodeURIComponent(searchParams.get('date') || '');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const config = type ? getEventTypeConfig(type) : null;

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

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <GuestDashboardClient
      eventType={type}
      eventName={name}
      eventDate={date}
      lang="en"
      isLoggedIn={isLoggedIn}
    />
  );
}

export default function CustomizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <CustomizeContent />
    </Suspense>
  );
}
