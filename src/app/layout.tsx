import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer, SkipLink } from '@/components/layout';
import { SkillsProvider } from '@/lib/context/skills-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Skills Store - Install Claude Skills Easily',
    template: '%s | Skills Store',
  },
  description:
    'Install superpowers into Claude in 2 clicks. No developer skills needed.',
  keywords: [
    'Claude',
    'AI',
    'skills',
    'Anthropic',
    'productivity',
    'automation',
  ],
  authors: [{ name: 'Skills Store' }],
  creator: 'Skills Store',
  openGraph: {
    title: 'Skills Store',
    description: 'Install superpowers into Claude in 2 clicks.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Skills Store',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Skills Store - Install Claude Skills Easily',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skills Store',
    description: 'Install superpowers into Claude in 2 clicks.',
    images: ['/images/og-image.png'],
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkillsProvider>
          <SkipLink />
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </SkillsProvider>
      </body>
    </html>
  );
}
