import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';

export type SleepRecommendationInput = {
  sleepQuality?: string | null;
  hoursSlept?: number | null;
  stressLevel?: string | null;
  dreamMood?: string | null;
  recentDreamSnippet?: string;
  goals?: string;
};

export type SleepRecommendation = {
  summary: string;
  tonightPlan: string[];
  windDown: string[];
  morningTip: string;
  provider: string;
};

export async function fetchSleepRecommendations(
  input: SleepRecommendationInput,
): Promise<SleepRecommendation> {
  const res = await authenticatedFetch('/api/sleep/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as SleepRecommendation & { message?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Could not generate recommendations');
  }
  return data;
}
