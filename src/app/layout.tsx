import type { Metadata, Viewport } from 'next';
import './globals.css';
import EmotionRegistry from '@/lib/EmotionRegistry';

export const metadata: Metadata = {
  title: 'HospiTesch — Smart Hospital Queue',
  description: 'QR-based realtime OPD queue management for hospitals',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,   // prevent accidental zoom on form inputs
  themeColor:    '#1565C0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
