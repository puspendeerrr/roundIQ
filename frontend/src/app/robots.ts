import { MetadataRoute } from 'next';

const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://roundiq.algorithyum.in';
};

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
