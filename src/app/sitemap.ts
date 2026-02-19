import { MetadataRoute } from 'next';
import { createServiceClient } from '@/lib/supabase/server';

const siteUrl = 'https://getinvita.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient();
  const lastModified = new Date();

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
          'en-US': `${siteUrl}/events/${event.slug}`,
          'es-US': `${siteUrl}/es/events/${event.slug}`,
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
          'en-US': `${siteUrl}/events/${event.slug}`,
          'es-US': `${siteUrl}/es/events/${event.slug}`,
        },
      },
    },
  ]);

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'en-US': siteUrl,
          'es-US': `${siteUrl}/es`,
        },
      },
    },
    {
      url: `${siteUrl}/es`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.95,
      alternates: {
        languages: {
          'en-US': siteUrl,
          'es-US': `${siteUrl}/es`,
        },
      },
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...eventPages,
  ];
}
