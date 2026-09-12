import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { publicAsset } from '@/lib/public-asset';
import './globals.css';
import './character.css';
import './decks.css';
import './presenter.css';
import './guide-interaction.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Juwairiyyah Saiyed — Product Portfolio',
  description:
    'Juwairiyyah Saiyed’s portfolio: frontend development, AI projects, data analytics, and project coordination, with guided project presentations.',
  robots: { index: false, follow: false },
  icons: { icon: publicAsset('/favicon.svg') },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
