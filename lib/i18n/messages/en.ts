export const en = {
  nav: {
    home: 'Home',
    explore: 'Explore',
    practice: 'Practice',
    journal: 'Journal',
    circles: 'Circles',
  },
  explore: {
    title: 'Explore',
    brand: 'Ariome',
    experiences: 'Experiences',
    moods: 'Moods',
    growth: 'Growth',
    fromTeachers: 'From your teachers',
    wisdomInsights: 'Wisdom & Insights',
    practicesRituals: 'Practices & Rituals',
    noWisdom: 'No wisdom clips match this mood.',
    noPractices: 'No practice clips match this mood.',
    noMoodMatch: 'Nothing in this mood yet — try "All".',
    guidedPractices: 'Guided Practices',
    localizedFeed: 'Showing content in {{locale}}',
    aiTranslated: 'AI translated',
    moodAll: 'All',
    moodPeaceful: 'Peaceful',
    moodGrateful: 'Grateful',
    moodHopeful: 'Hopeful',
    moodJoyful: 'Joyful',
    moodReflective: 'Reflective',
    moodAnxious: 'Anxious',
    fullAccess: 'Full access',
    freePreview: '20s free',
    clipLabel: '{{sec}}s clip',
    fullScreen: 'Full screen',
    premium: 'Premium',
    byAuthor: 'by {{author}}',
    min: 'min',
  },
  language: {
    label: 'Language',
    change: 'Change language',
  },
} as const;

export type Messages = {
  [K in keyof typeof en]: {
    [P in keyof (typeof en)[K]]: string;
  };
};
