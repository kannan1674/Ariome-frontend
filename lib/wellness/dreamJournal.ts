export type DreamMood =
  | 'Peaceful'
  | 'Vivid'
  | 'Lucid'
  | 'Anxious'
  | 'Nightmare'
  | 'Mystical';

export type SleepQuality = 'Restful' | 'Okay' | 'Restless' | 'Poor';

export type DreamEntry = {
  id: string;
  createdAt: number;
  title: string;
  body: string;
  mood: DreamMood;
  sleepQuality: SleepQuality;
};

const STORAGE_KEY = 'ariome_dream_journal';

export const DREAM_MOODS: DreamMood[] = [
  'Peaceful',
  'Vivid',
  'Lucid',
  'Anxious',
  'Nightmare',
  'Mystical',
];

export const SLEEP_QUALITIES: SleepQuality[] = ['Restful', 'Okay', 'Restless', 'Poor'];

function read(): DreamEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DreamEntry[];
  } catch {
    return [];
  }
}

function write(entries: DreamEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getDreamEntries(): DreamEntry[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveDreamEntry(
  entry: Omit<DreamEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: number },
): DreamEntry {
  const full: DreamEntry = {
    id: entry.id ?? (crypto.randomUUID?.() ?? `dream-${Date.now()}`),
    createdAt: entry.createdAt ?? Date.now(),
    title: entry.title.trim(),
    body: entry.body.trim(),
    mood: entry.mood,
    sleepQuality: entry.sleepQuality,
  };
  write([full, ...read().filter((e) => e.id !== full.id)]);
  return full;
}

export function deleteDreamEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}
