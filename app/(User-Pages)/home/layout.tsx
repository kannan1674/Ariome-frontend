import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home — AriOme Wellness',
  description:
    'Your wellness home on AriOme. Check in with your mood, explore films and guided practices, reflect in your journal, and join community events.',
  keywords: 'wellness OTT, mental health streaming, meditation, mindfulness, AriOme, guided practice, journal',
  openGraph: {
    title: 'Home — AriOme Wellness',
    description: 'Stream calm. Practice mindfulness. Reflect and grow with AriOme.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home — AriOme Wellness',
    description: 'Stream calm. Practice mindfulness. Reflect and grow with AriOme.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/home',
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

