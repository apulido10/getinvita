import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/order', '/dashboard', '/demo', '/api/'],
    },
    sitemap: 'https://getinvita.com/sitemap.xml',
    host: 'https://getinvita.com',
  };
}
