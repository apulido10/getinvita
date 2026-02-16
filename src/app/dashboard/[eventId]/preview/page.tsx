export const dynamic = 'force-dynamic';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FullEventData } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import { Lang } from '@/lib/translations';
import Sweet15Template from '@/components/templates/Sweet15Template';
import WeddingTemplate from '@/components/templates/WeddingTemplate';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import BabyShowerTemplate from '@/components/templates/BabyShowerTemplate';
import InvitationIntro from '@/components/shared/InvitationIntro';

function parseLang(raw?: string): Lang {
  return raw === 'es' ? 'es' : 'en';
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ theme_id?: string; lang?: string }>;
}) {
  const { eventId } = await params;
  const { theme_id, lang: langParam } = await searchParams;
  const lang = parseLang(langParam);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const serviceClient = createServiceClient();

  const { data: event } = await serviceClient
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
    serviceClient.from('event_details').select('*').eq('event_id', event.id),
    serviceClient.from('event_photos').select('*').eq('event_id', event.id).order('display_order'),
    serviceClient.from('event_music').select('*').eq('event_id', event.id),
    serviceClient.from('rsvps').select('*').eq('event_id', event.id),
  ]);

  const eventData: FullEventData = {
    event,
    details: details || [],
    photos: photos || [],
    music: music || [],
    rsvps: rsvps || [],
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const theme = theme_id
    ? getThemeById(theme_id)
    : event.theme_id
    ? getThemeById(event.theme_id)
    : getDefaultTheme(event.event_type);

  const templateProps = { data: eventData, supabaseUrl, theme, lang };

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
    case 'valentines':
    case 'mothers_day':
    case 'fathers_day':
      template = <BirthdayTemplate {...templateProps} />;
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
      lang={lang}
    >
      {template}
    </InvitationIntro>
  );
}
