import { requireAuth } from '@/lib/supabase/auth';
import { notFound } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { FullEventData } from '@/types';

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { user, supabase } = await requireAuth();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single();

  if (!event) {
    notFound();
  }

  const [
    { data: details },
    { data: photos },
    { data: music },
    { data: rsvps },
  ] = await Promise.all([
    supabase.from('event_details').select('*').eq('event_id', event.id),
    supabase.from('event_photos').select('*').eq('event_id', event.id).order('display_order'),
    supabase.from('event_music').select('*').eq('event_id', event.id),
    supabase.from('rsvps').select('*').eq('event_id', event.id).order('created_at', { ascending: false }),
  ]);

  const eventData: FullEventData = {
    event,
    details: details || [],
    photos: photos || [],
    music: music || [],
    rsvps: rsvps || [],
  };

  return <DashboardClient initialData={eventData} />;
}
