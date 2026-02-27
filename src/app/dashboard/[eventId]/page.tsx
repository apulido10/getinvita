export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { FullEventData } from '@/types';
import { Lang } from '@/lib/translations';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EventDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { eventId } = await params;
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === 'es' ? 'es' : 'en';

  const serviceClient = createServiceClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let event = null;
  let isGuest = false;

  if (user) {
    // Try to find event owned by user
    const { data } = await serviceClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single();
    event = data;

    // If not found under user_id, check if there's an anonymous event we can claim
    if (!event) {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get('gi_event_access')?.value;
      if (cookieVal) {
        const colonIdx = cookieVal.indexOf(':');
        const cookieId = cookieVal.slice(0, colonIdx);
        const cookieToken = cookieVal.slice(colonIdx + 1);
        if (cookieId === eventId && cookieToken) {
          const { data: anonEvent } = await serviceClient
            .from('events')
            .select('*')
            .eq('id', eventId)
            .eq('access_token', cookieToken)
            .is('user_id', null)
            .single();
          if (anonEvent) {
            // Claim the event
            await serviceClient
              .from('events')
              .update({ user_id: user.id })
              .eq('id', eventId);
            event = { ...anonEvent, user_id: user.id };
          }
        }
      }
    }
  } else {
    // Not logged in — check access_token cookie
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get('gi_event_access')?.value;
    if (cookieVal) {
      const colonIdx = cookieVal.indexOf(':');
      const cookieId = cookieVal.slice(0, colonIdx);
      const cookieToken = cookieVal.slice(colonIdx + 1);
      if (cookieId === eventId && cookieToken) {
        const { data } = await serviceClient
          .from('events')
          .select('*')
          .eq('id', eventId)
          .eq('access_token', cookieToken)
          .is('user_id', null)
          .single();
        event = data;
        isGuest = true;
      }
    }
  }

  if (!event) {
    notFound();
  }

  const [
    { data: details },
    { data: photos },
    { data: music },
    { data: rsvps },
  ] = await Promise.all([
    serviceClient.from('event_details').select('*').eq('event_id', event.id),
    serviceClient.from('event_photos').select('*').eq('event_id', event.id).order('display_order'),
    serviceClient.from('event_music').select('*').eq('event_id', event.id),
    serviceClient.from('rsvps').select('*').eq('event_id', event.id).order('created_at', { ascending: false }),
  ]);

  const eventData: FullEventData = {
    event,
    details: details || [],
    photos: photos || [],
    music: music || [],
    rsvps: rsvps || [],
  };

  return <DashboardClient initialData={eventData} lang={lang} isGuest={isGuest} />;
}
