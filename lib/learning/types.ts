export type ProgramDay = {
  day: number;
  title: string;
  focus: string;
  durationMin: number;
};

export type MultiDayProgram = {
  id: string;
  title: string;
  description: string;
  creator: string;
  days: number;
  emoji: string;
  level: 'Beginner' | 'Intermediate';
  schedule: ProgramDay[];
};

export type CourseLesson = {
  id: string;
  title: string;
  durationMin: number;
};

export type CreatorCourse = {
  id: string;
  title: string;
  description: string;
  creator: string;
  lessons: CourseLesson[];
  emoji: string;
  weeks: number;
};

export type HabitStep = {
  day: number;
  title: string;
  action: string;
};

export type HabitJourney = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  days: number;
  steps: HabitStep[];
};

export type Certificate = {
  id: string;
  type: 'program' | 'course' | 'journey';
  itemId: string;
  title: string;
  issuedAt: number;
  creator: string;
};

export type LearningProgress = {
  programs: Record<string, { enrolledAt: number; completedDays: number[] }>;
  courses: Record<string, { enrolledAt: number; completedLessons: string[] }>;
  journeys: Record<string, { enrolledAt: number; completedDays: number[] }>;
  certificates: Certificate[];
};
