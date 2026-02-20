import { MetadataRoute } from 'next';
import { createServiceClient } from '@/lib/supabase/server';

const siteUrl = 'https://getinvita.com';
const staticLastModified = new Date('2026-02-14T00:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('status', 'published');

  const eventPages: MetadataRoute.Sitemap = (events || []).flatMap((event) => [
    {
      url: `${siteUrl}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${siteUrl}/events/${event.slug}`,
          es: `${siteUrl}/es/events/${event.slug}`,
          'en-US': `${siteUrl}/events/${event.slug}`,
          'es-US': `${siteUrl}/es/events/${event.slug}`,
          'x-default': `${siteUrl}/events/${event.slug}`,
        },
      },
    },
    {
      url: `${siteUrl}/es/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: 'weekly',
      priority: 0.75,
      alternates: {
        languages: {
          en: `${siteUrl}/events/${event.slug}`,
          es: `${siteUrl}/es/events/${event.slug}`,
          'en-US': `${siteUrl}/events/${event.slug}`,
          'es-US': `${siteUrl}/es/events/${event.slug}`,
          'x-default': `${siteUrl}/events/${event.slug}`,
        },
      },
    },
  ]);

  return [
    {
      url: siteUrl,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: siteUrl,
          es: `${siteUrl}/es`,
          'en-US': siteUrl,
          'es-US': `${siteUrl}/es`,
          'x-default': siteUrl,
        },
      },
    },
    {
      url: `${siteUrl}/es`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.95,
      alternates: {
        languages: {
          en: siteUrl,
          es: `${siteUrl}/es`,
          'en-US': siteUrl,
          'es-US': `${siteUrl}/es`,
          'x-default': siteUrl,
        },
      },
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...eventPages,
  ];
}
