import type { CreatorCourse, HabitJourney, MultiDayProgram } from './types';

export const MULTI_DAY_PROGRAMS: MultiDayProgram[] = [
  {
    id: 'calm-7',
    title: '7-Day Calm Reset',
    description: 'A gentle week to soften stress and rebuild steady focus.',
    creator: 'Ariome Studio',
    days: 7,
    emoji: '🌿',
    level: 'Beginner',
    schedule: [
      { day: 1, title: 'Arrive', focus: 'Breath awareness & body scan', durationMin: 12 },
      { day: 2, title: 'Release', focus: 'Let go of shoulder and jaw tension', durationMin: 14 },
      { day: 3, title: 'Ground', focus: 'Feet, earth, and slow walking meditation', durationMin: 10 },
      { day: 4, title: 'Clarity', focus: 'Morning intention & mindful pause', durationMin: 15 },
      { day: 5, title: 'Kindness', focus: 'Loving-kindness for self and others', durationMin: 16 },
      { day: 6, title: 'Stillness', focus: 'Extended sit with soft bell', durationMin: 18 },
      { day: 7, title: 'Integrate', focus: 'Reflection and your calm anchor', durationMin: 20 },
    ],
  },
  {
    id: 'sleep-14',
    title: '14-Night Sleep Journey',
    description: 'Progressive evenings to unwind the nervous system before bed.',
    creator: 'Dr. Mira Chen',
    days: 14,
    emoji: '🌙',
    level: 'Beginner',
    schedule: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Night ${i + 1}`,
      focus: i < 7 ? 'Wind-down breath & body melt' : 'Dream journaling & deep rest',
      durationMin: 10 + (i % 5),
    })),
  },
  {
    id: 'focus-21',
    title: '21-Day Focus Path',
    description: 'Build sustainable attention habits without burnout.',
    creator: 'Jordan Ellis',
    days: 21,
    emoji: '🎯',
    level: 'Intermediate',
    schedule: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      focus: 'Pomodoro mindfulness, digital pause, and review',
      durationMin: 15,
    })),
  },
];

export const CREATOR_COURSES: CreatorCourse[] = [
  {
    id: 'breath-fundamentals',
    title: 'Breathwork Fundamentals',
    description: 'Master box, 4-7-8, and coherent breathing with guided practice.',
    creator: 'Jordan Ellis',
    weeks: 4,
    emoji: '🌬️',
    lessons: [
      { id: 'l1', title: 'Why the breath matters', durationMin: 18 },
      { id: 'l2', title: 'Box breathing deep dive', durationMin: 22 },
      { id: 'l3', title: '4-7-8 for sleep', durationMin: 16 },
      { id: 'l4', title: 'Daily practice plan', durationMin: 12 },
    ],
  },
  {
    id: 'mindful-parenting',
    title: 'Mindful Parenting',
    description: 'Pause, respond, and model calm for your family.',
    creator: 'Sofia Reyes',
    weeks: 6,
    emoji: '💛',
    lessons: [
      { id: 'l1', title: 'The reactive loop', durationMin: 20 },
      { id: 'l2', title: 'Co-regulation basics', durationMin: 24 },
      { id: 'l3', title: 'Bedtime rituals', durationMin: 15 },
      { id: 'l4', title: 'Repair after conflict', durationMin: 19 },
      { id: 'l5', title: 'Your family anchor', durationMin: 14 },
    ],
  },
  {
    id: 'yoga-nidra',
    title: 'Yoga Nidra Essentials',
    description: 'Learn structured deep relaxation for rest and recovery.',
    creator: 'Ariome Studio',
    weeks: 3,
    emoji: '✨',
    lessons: [
      { id: 'l1', title: 'Introduction to Nidra', durationMin: 25 },
      { id: 'l2', title: 'Body rotation practice', durationMin: 30 },
      { id: 'l3', title: 'Sleep-specific scripts', durationMin: 28 },
    ],
  },
];

export const HABIT_JOURNEYS: HabitJourney[] = [
  {
    id: 'morning-light',
    title: 'Morning Light Ritual',
    description: 'Start each day with sunlight, water, and one mindful breath.',
    emoji: '☀️',
    days: 10,
    steps: Array.from({ length: 10 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      action: 'Step outside for 5 minutes of natural light before checking your phone.',
    })),
  },
  {
    id: 'gratitude-chain',
    title: 'Gratitude Chain',
    description: 'Write three specific gratitudes daily and notice the shift.',
    emoji: '📝',
    days: 14,
    steps: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      action: 'List three gratitudes — one about yourself, one about someone else, one about today.',
    })),
  },
  {
    id: 'digital-sunset',
    title: 'Digital Sunset',
    description: 'Create a screen-free buffer before sleep.',
    emoji: '📵',
    days: 7,
    steps: [
      { day: 1, title: 'Notice', action: 'Log your average screen-off time tonight.' },
      { day: 2, title: 'Shift', action: 'Move screens off 15 minutes earlier.' },
      { day: 3, title: 'Replace', action: 'Swap scrolling with tea or stretching.' },
      { day: 4, title: 'Dim', action: 'Lower lights 30 minutes before bed.' },
      { day: 5, title: 'Breathe', action: '5 minutes of 4-7-8 breathing.' },
      { day: 6, title: 'Journal', action: 'Write one line about the day.' },
      { day: 7, title: 'Celebrate', action: 'Reflect on how your body feels.' },
    ],
  },
];

export function getProgram(id: string) {
  return MULTI_DAY_PROGRAMS.find((p) => p.id === id);
}

export function getCourse(id: string) {
  return CREATOR_COURSES.find((c) => c.id === id);
}

export function getJourney(id: string) {
  return HABIT_JOURNEYS.find((j) => j.id === id);
}
