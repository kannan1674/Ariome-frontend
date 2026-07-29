export type AiClip = {
  title: string;
  description: string;
  durationSec: number;
  hook: string;
  mood: string;
};

export type ReflectionCardInsight = {
  insight: string;
  gratitude: string;
  gentleChallenge: string;
  affirmation: string;
  provider?: string;
};

export type ShortScript = {
  title: string;
  hook: string;
  script: string;
  hashtags: string[];
  visualNotes: string;
  durationSec: number;
  mood: string;
};

export type ReflectionEntry = {
  id: string;
  createdAt: number;
  moodBefore: string;
  moodAfter: string;
  body: string;
  cardInsight?: ReflectionCardInsight;
};
