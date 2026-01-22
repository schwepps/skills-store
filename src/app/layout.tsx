import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skills Store - Install Claude Skills Easily',
  description:
    "Installe des super-pouvoirs dans Claude en 3 clics. Pas besoin d'être développeur.",
  keywords: ['Claude', 'AI', 'skills', 'Anthropic', 'productivity'],
  authors: [{ name: 'Skills Store' }],
  openGraph: {
    title: 'Skills Store',
    description: 'Installe des super-pouvoirs dans Claude en 3 clics.',
    type: 'website',
    locale: 'fr_FR',
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
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
