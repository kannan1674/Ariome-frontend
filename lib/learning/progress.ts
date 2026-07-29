import type { Certificate, LearningProgress } from './types';
import { getCourse, getJourney, getProgram } from './catalog';

const STORAGE_KEY = 'ariome_learning_progress';

const DEFAULT: LearningProgress = {
  programs: {},
  courses: {},
  journeys: {},
  certificates: [],
};

function read(): LearningProgress {
  if (typeof window === 'undefined') return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

function write(data: LearningProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getLearningProgress(): LearningProgress {
  return read();
}

function issueCertificate(
  data: LearningProgress,
  cert: Omit<Certificate, 'id' | 'issuedAt'>,
): LearningProgress {
  if (data.certificates.some((c) => c.type === cert.type && c.itemId === cert.itemId)) {
    return data;
  }
  return {
    ...data,
    certificates: [
      {
        ...cert,
        id: `cert-${cert.type}-${cert.itemId}-${Date.now()}`,
        issuedAt: Date.now(),
      },
      ...data.certificates,
    ],
  };
}

export function enrollProgram(programId: string) {
  const data = read();
  if (data.programs[programId]) return data;
  data.programs[programId] = { enrolledAt: Date.now(), completedDays: [] };
  write(data);
  return data;
}

export function completeProgramDay(programId: string, day: number) {
  const data = read();
  const entry = data.programs[programId] ?? { enrolledAt: Date.now(), completedDays: [] };
  if (!entry.completedDays.includes(day)) entry.completedDays.push(day);
  data.programs[programId] = entry;

  const program = getProgram(programId);
  if (program && entry.completedDays.length >= program.days) {
    write(
      issueCertificate(data, {
        type: 'program',
        itemId: programId,
        title: program.title,
        creator: program.creator,
      }),
    );
    return;
  }
  write(data);
}

export function enrollCourse(courseId: string) {
  const data = read();
  if (data.courses[courseId]) return data;
  data.courses[courseId] = { enrolledAt: Date.now(), completedLessons: [] };
  write(data);
  return data;
}

export function completeLesson(courseId: string, lessonId: string) {
  const data = read();
  const entry = data.courses[courseId] ?? { enrolledAt: Date.now(), completedLessons: [] };
  if (!entry.completedLessons.includes(lessonId)) entry.completedLessons.push(lessonId);
  data.courses[courseId] = entry;

  const course = getCourse(courseId);
  if (course && entry.completedLessons.length >= course.lessons.length) {
    write(
      issueCertificate(data, {
        type: 'course',
        itemId: courseId,
        title: course.title,
        creator: course.creator,
      }),
    );
    return;
  }
  write(data);
}

export function enrollJourney(journeyId: string) {
  const data = read();
  if (data.journeys[journeyId]) return data;
  data.journeys[journeyId] = { enrolledAt: Date.now(), completedDays: [] };
  write(data);
  return data;
}

export function completeJourneyDay(journeyId: string, day: number) {
  const data = read();
  const entry = data.journeys[journeyId] ?? { enrolledAt: Date.now(), completedDays: [] };
  if (!entry.completedDays.includes(day)) entry.completedDays.push(day);
  data.journeys[journeyId] = entry;

  const journey = getJourney(journeyId);
  if (journey && entry.completedDays.length >= journey.days) {
    write(
      issueCertificate(data, {
        type: 'journey',
        itemId: journeyId,
        title: journey.title,
        creator: 'Ariome',
      }),
    );
    return;
  }
  write(data);
}
