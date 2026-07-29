import type { PracticeStreak } from './types';

const STORAGE_KEY = 'ariome_practice_streak';

const DEFAULT: PracticeStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalSessions: 0,
  practicedDates: [],
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function read(): PracticeStreak {
  if (typeof window === 'undefined') return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

function write(data: PracticeStreak) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPracticeStreak(): PracticeStreak {
  return read();
}

/** Call when user completes a meaningful practice session. */
export function recordPracticeSession(): PracticeStreak {
  const current = read();
  const today = todayKey();
  const yesterday = yesterdayKey();

  if (current.practicedDates.includes(today)) {
    const next = { ...current, totalSessions: current.totalSessions + 1 };
    write(next);
    return next;
  }

  let currentStreak = 1;
  if (current.lastPracticeDate === yesterday) {
    currentStreak = current.currentStreak + 1;
  } else if (current.lastPracticeDate === today) {
    currentStreak = current.currentStreak;
  }

  const practicedDates = [today, ...current.practicedDates.filter((d) => d !== today)].slice(0, 120);
  const next: PracticeStreak = {
    currentStreak,
    longestStreak: Math.max(current.longestStreak, currentStreak),
    lastPracticeDate: today,
    totalSessions: current.totalSessions + 1,
    practicedDates,
  };
  write(next);
  return next;
}

export function streakMessage(streak: PracticeStreak) {
  if (streak.currentStreak === 0) return 'Start your streak today';
  if (streak.currentStreak === 1) return '1 day — great start';
  return `${streak.currentStreak} day streak — keep going`;
}
