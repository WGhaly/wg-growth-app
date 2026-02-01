import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { OnlineStatus } from '@/components/pwa/OnlineStatus';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'WG Growth App - Personal Life Operating System',
  description: 'Your personal growth companion for habits, routines, goals, and more. Track progress and build a better life.',
  manifest: '/manifest.json',
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: 'WG Growth'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/icon-192x192.png'
  },
  applicationName: 'WG Growth App',
  keywords: ['habits', 'routines', 'goals', 'productivity', 'personal growth', 'self improvement']
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0F0F',
  viewportFit: 'cover' // This enables safe-area-inset on iOS
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <OnlineStatus />
          {children}
          <PWAInstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
