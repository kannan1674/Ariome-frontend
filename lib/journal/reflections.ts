import type { ReflectionEntry } from '@/lib/content/types';

const STORAGE_KEY = 'ariome_reflections';

function read(): ReflectionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReflectionEntry[];
  } catch {
    return [];
  }
}

function write(entries: ReflectionEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getReflections(): ReflectionEntry[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveReflection(
  entry: Omit<ReflectionEntry, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: number;
    cardInsight?: ReflectionEntry['cardInsight'];
  },
): ReflectionEntry {
  const full: ReflectionEntry = {
    id: entry.id ?? (crypto.randomUUID?.() ?? `ref-${Date.now()}`),
    createdAt: entry.createdAt ?? Date.now(),
    moodBefore: entry.moodBefore,
    moodAfter: entry.moodAfter,
    body: entry.body.trim(),
    cardInsight: entry.cardInsight,
  };
  write([full, ...read().filter((e) => e.id !== full.id)]);
  return full;
}

export function updateReflectionInsight(id: string, cardInsight: ReflectionEntry['cardInsight']) {
  const entries = read();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return;
  entries[idx] = { ...entries[idx], cardInsight };
  write(entries);
}
