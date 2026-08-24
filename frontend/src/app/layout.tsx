import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoundIQ — Human Technical Interview Marketplace',
  description:
    'Discover & book verified software engineers for real mock technical interviews. Practice DSA, System Design, React, Node.js & more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col bg-white text-zinc-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
