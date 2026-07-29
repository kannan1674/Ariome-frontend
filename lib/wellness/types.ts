export type BreathingPatternId = 'box' | '478' | 'calm';

export type BreathingPattern = {
  id: BreathingPatternId;
  label: string;
  description: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  cycles: number;
};

export type AmbientSoundId =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'white'
  | 'brown'
  | 'bowl'
  | 'piano'
  | 'flute'
  | 'mindRelax'
  | 'zenPad'
  | 'calmFlow'
  | 'delta'
  | 'nightDrone'
  | 'heartbeat'
  | 'cosmic';

export type AmbientSound = {
  id: AmbientSoundId;
  label: string;
  emoji: string;
  description: string;
  category?: 'ambient' | 'deep-sleep' | 'relax';
};

export type PracticeStreak = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalSessions: number;
  practicedDates: string[];
};

export type TimerPreset = {
  label: string;
  minutes: number;
};
