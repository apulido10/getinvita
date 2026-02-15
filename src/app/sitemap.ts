import { MetadataRoute } from 'next';
import { createServiceClient } from '@/lib/supabase/server';

const siteUrl = 'https://getinvita.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient();

  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('status', 'published');

  const eventPages: MetadataRoute.Sitemap = (events || []).map((event) => ({
    url: `${siteUrl}/events/${event.slug}`,
    lastModified: new Date(event.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...eventPages,
  ];
}
