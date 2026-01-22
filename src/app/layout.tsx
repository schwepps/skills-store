import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer, SkipLink } from '@/components/layout';
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
    "Installe des super-pouvoirs dans Claude en 3 clics. Pas besoin d'être développeur.",
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
    description: 'Installe des super-pouvoirs dans Claude en 3 clics.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Skills Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skills Store',
    description: 'Installe des super-pouvoirs dans Claude en 3 clics.',
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
    <html lang="fr">
      <body className={inter.className}>
        <SkipLink />
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
