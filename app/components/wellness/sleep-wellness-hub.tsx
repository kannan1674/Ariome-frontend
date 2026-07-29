'use client';

import AiSleepRecommendations from './ai-sleep-recommendations';
import DeepSleepMusic from './deep-sleep-music';
import DreamJournalTeaser from './dream-journal-teaser';
import SleepTimer from './sleep-timer';

type Props = { onSessionComplete?: () => void };

export default function SleepWellnessHub({ onSessionComplete }: Props) {
  return (
    <div className="space-y-6">
      <AiSleepRecommendations />
      <DeepSleepMusic />
      <DreamJournalTeaser />
      <SleepTimer onSessionComplete={onSessionComplete} />
    </div>
  );
}
