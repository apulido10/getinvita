import { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FullEventData } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import { Lang, t } from '@/lib/translations';
import Sweet15Template from '@/components/templates/Sweet15Template';
import WeddingTemplate from '@/components/templates/WeddingTemplate';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import BabyShowerTemplate from '@/components/templates/BabyShowerTemplate';
import InvitationIntro from '@/components/shared/InvitationIntro';
import PoweredByFooter from '@/components/shared/PoweredByFooter';

function parseLang(raw?: string): Lang {
  return raw === 'es' ? 'es' : 'en';
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = parseLang(langParam);
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!event) {
    return { title: 'Event Not Found' };
  }

  const { data: photos } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_hero', true)
    .limit(1);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const heroPhoto = photos?.[0];
  const ogImage = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : undefined;

  const typeLabel = t(`eventType.${event.event_type}`, lang) || 'Event';
  const title = event.event_name;
  const description = t('meta.description', lang, { name: event.event_name, type: typeLabel });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://getinvita.com/events/${slug}`,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: event.event_name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = parseLang(langParam);
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

  const typeLabel = t(`eventType.${event.event_type}`, lang) || 'Event';
  const heroPhoto = (photos || []).find((p) => p.is_hero);
  const ogImage = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.event_name,
    description: t('meta.description', lang, { name: event.event_name, type: typeLabel }),
    ...(event.event_date && { startDate: event.event_date }),
    ...(ogImage && { image: ogImage }),
    organizer: {
      '@type': 'Organization',
      name: 'GetInvita',
      url: 'https://getinvita.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InvitationIntro
        eventName={event.event_name}
        eventType={event.event_type}
        colors={theme!.colors}
        eventId={event.id}
        lang={lang}
      >
        {template}
        <PoweredByFooter colors={theme!.colors} lang={lang} />
      </InvitationIntro>
    </>
  );
}
