import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/order', '/api/'],
    },
    sitemap: 'https://getinvita.com/sitemap.xml',
    host: 'https://getinvita.com',
  };
}
