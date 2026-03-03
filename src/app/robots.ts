import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/demo', '/api/', '/auth/', '/order'],
    },
    sitemap: 'https://getinvita.com/sitemap.xml',
    host: 'https://getinvita.com',
  };
}
