import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://roundiq.algorithyum.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RoundIQ — Human Technical Interview Marketplace & Hiring Platform',
    template: '%s | RoundIQ',
  },
  description:
    'Discover & book verified software engineers for 1-on-1 real mock technical interviews. Practice DSA, System Design, React, Node.js & get hired by top tech companies.',
  keywords: [
    'Mock Technical Interview',
    'System Design Mock Interview',
    'DSA Mock Interview',
    'SDE Interview Prep',
    'FAANG Interview Practice',
    'Technical Recruiter Marketplace',
  ],
  authors: [{ name: 'RoundIQ Team' }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'RoundIQ — Human Technical Interview Marketplace & Hiring Platform',
    description:
      'Book 1-on-1 mock technical interviews with verified senior SDEs from top tech companies.',
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: 'RoundIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoundIQ — Human Technical Interview Marketplace',
    description: 'Practice real technical interviews with senior SDEs from top tech companies.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RoundIQ',
  url: SITE_URL,
  description: 'Human Technical Interview Marketplace & Hiring Platform',
  publisher: {
    '@type': 'Organization',
    name: 'RoundIQ',
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${inter.className} flex min-h-full flex-col bg-white text-zinc-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
