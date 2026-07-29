export type AuthPageVariant = 'signin' | 'signup' | 'forgot' | 'reset' | 'verify';

export const AUTH_IMAGES = {
  background: '/media/auth/bg-aurora.jpg',
  meditation: '/media/auth/hero-meditation.jpg',
  cinema: '/media/auth/hero-cinema.jpg',
} as const;

export const authPageCopy: Record<
  AuthPageVariant,
  { headline: string; lines: string[]; moods: string[]; heroImage: string; accent: string }
> = {
  signin: {
    headline: 'Stream your calm',
    lines: [
      'Sign in to continue watching curated wellness films and guided practices.',
      'Your mindful viewing journey picks up right where you left off.',
    ],
    moods: ['Peaceful', 'Hopeful', 'Reflective'],
    heroImage: AUTH_IMAGES.cinema,
    accent: 'from-teal-500/30 via-indigo-500/20 to-violet-600/30',
  },
  signup: {
    headline: 'Begin your wellness journey',
    lines: [
      'Join AriOme — an OTT space for mental health stories, meditation, and healing content.',
      'Create your account and discover films that help you feel grounded.',
    ],
    moods: ['Grateful', 'Joyful', 'Calm'],
    heroImage: AUTH_IMAGES.meditation,
    accent: 'from-emerald-500/30 via-teal-500/20 to-cyan-600/30',
  },
  forgot: {
    headline: 'We’ll help you back in',
    lines: [
      'Reset access to your wellness library in a few simple steps.',
      'Your saved moods, progress, and playlists stay safe.',
    ],
    moods: ['Secure', 'Simple', 'Supportive'],
    heroImage: AUTH_IMAGES.meditation,
    accent: 'from-violet-500/30 via-indigo-500/20 to-teal-600/30',
  },
  reset: {
    headline: 'Fresh start, same sanctuary',
    lines: [
      'Choose a new password and return to streaming content that supports your wellbeing.',
      'Strong credentials keep your personal journey protected.',
    ],
    moods: ['Protected', 'Private', 'Peaceful'],
    heroImage: AUTH_IMAGES.cinema,
    accent: 'from-fuchsia-500/25 via-indigo-500/20 to-teal-600/30',
  },
  verify: {
    headline: 'Almost there',
    lines: [
      'Verify your account to unlock personalized wellness recommendations.',
      'One quick step before your cinematic healing experience begins.',
    ],
    moods: ['Verified', 'Trusted', 'Ready'],
    heroImage: AUTH_IMAGES.meditation,
    accent: 'from-teal-500/30 via-sky-500/20 to-indigo-600/30',
  },
};

export const authPrimaryButtonClass =
  'h-11 w-full rounded-xl bg-purple-600 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-700 disabled:opacity-60';

export const authLinkClass =
  'font-semibold text-teal-600 hover:text-indigo-700 hover:underline underline-offset-2';

export const authMoodPillClass =
  'rounded-full border border-white/20 bg-gradient-to-r from-white/15 to-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm';
