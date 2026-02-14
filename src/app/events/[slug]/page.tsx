import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FullEventData } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import Sweet15Template from '@/components/templates/Sweet15Template';
import WeddingTemplate from '@/components/templates/WeddingTemplate';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import BabyShowerTemplate from '@/components/templates/BabyShowerTemplate';
import InvitationIntro from '@/components/shared/InvitationIntro';

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
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
    supabase.from('rsvps').select('*').eq('event_id', event.id),
  ]);

  const eventData: FullEventData = {
    event,
    details: details || [],
    photos: photos || [],
    music: music || [],
    rsvps: rsvps || [],
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const theme = event.theme_id
    ? getThemeById(event.theme_id)
    : getDefaultTheme(event.event_type);

  const templateProps = { data: eventData, supabaseUrl, theme };

  let template;
  switch (event.event_type) {
    case 'sweet15':
      template = <Sweet15Template {...templateProps} />;
      break;
    case 'wedding':
      template = <WeddingTemplate {...templateProps} />;
      break;
    case 'birthday':
      template = <BirthdayTemplate {...templateProps} />;
      break;
    case 'baby_shower':
      template = <BabyShowerTemplate {...templateProps} />;
      break;
    default:
      notFound();
  }

  return (
    <InvitationIntro
      eventName={event.event_name}
      eventType={event.event_type}
      colors={theme!.colors}
      eventId={event.id}
    >
      {template}
    </InvitationIntro>
  );
}
