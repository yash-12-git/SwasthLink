import type { Metadata, Viewport } from 'next';
import './globals.css';
import EmotionRegistry from '@/lib/EmotionRegistry';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'SwasthLink — Smart Hospital Queue',
  description: 'QR-based realtime OPD queue management for hospitals',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  themeColor:    '#1565C0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </EmotionRegistry>
      </body>
    </html>
  );
}
