'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CREATOR_COURSES, HABIT_JOURNEYS, MULTI_DAY_PROGRAMS } from '@/lib/learning/catalog';
import {
  completeJourneyDay,
  completeLesson,
  completeProgramDay,
  enrollCourse,
  enrollJourney,
  enrollProgram,
  getLearningProgress,
} from '@/lib/learning/progress';
import type { Certificate } from '@/lib/learning/types';
import {
  Award,
  BookOpen,
  CalendarRange,
  Check,
  Route,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Tab = 'programs' | 'courses' | 'journeys' | 'certificates';

const TABS: { id: Tab; label: string; icon: typeof CalendarRange }[] = [
  { id: 'programs', label: 'Multi-day programs', icon: CalendarRange },
  { id: 'courses', label: 'Creator courses', icon: BookOpen },
  { id: 'journeys', label: 'Habit journeys', icon: Route },
  { id: 'certificates', label: 'Certificates', icon: Award },
];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(ts));
}

export default function ProgramsHub() {
  const [tab, setTab] = useState<Tab>('programs');
  const [progress, setProgress] = useState(getLearningProgress);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => setProgress(getLearningProgress()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const certificates = progress.certificates;

  return (
    <section aria-labelledby="programs-hub-heading">
      <h2 id="programs-hub-heading" className="sr-only">
        Programs and learning
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold sm:text-sm',
                tab === t.id
                  ? 'border-[var(--ariome-gold)]/50 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)] shadow-sm'
                  : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'programs' && (
        <div className="mt-6 space-y-4">
          {MULTI_DAY_PROGRAMS.map((program) => {
            const enrolled = progress.programs[program.id];
            const done = enrolled?.completedDays.length ?? 0;
            const pct = Math.round((done / program.days) * 100);
            const open = expandedId === program.id;
            return (
              <article
                key={program.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm ring-1 ring-white/5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>
                    {program.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white">{program.title}</h3>
                    <p className="mt-1 text-sm text-white/55">{program.description}</p>
                    <p className="mt-2 text-xs text-white/45">
                      {program.days} days · {program.level} · by {program.creator}
                    </p>
                    {enrolled && (
                      <div className="mt-3">
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-teal-700">
                          {done} of {program.days} days complete ({pct}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!enrolled ? (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-500"
                      onClick={() => {
                        enrollProgram(program.id);
                        refresh();
                        setExpandedId(program.id);
                      }}
                    >
                      Enroll
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={() => setExpandedId(open ? null : program.id)}>
                      {open ? 'Hide schedule' : 'View schedule'}
                    </Button>
                  )}
                </div>
                {open && enrolled && (
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {program.schedule.map((day) => {
                      const complete = enrolled.completedDays.includes(day.day);
                      return (
                        <li
                          key={day.day}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              Day {day.day}: {day.title}
                            </p>
                            <p className="text-xs text-white/45">{day.focus} · {day.durationMin} min</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={complete ? 'outline' : 'default'}
                            className={cn(!complete && 'bg-teal-600 hover:bg-teal-500')}
                            disabled={complete}
                            onClick={() => {
                              completeProgramDay(program.id, day.day);
                              refresh();
                            }}
                          >
                            {complete ? <Check className="size-4" /> : 'Done'}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      {tab === 'courses' && (
        <div className="mt-6 space-y-4">
          {CREATOR_COURSES.map((course) => {
            const enrolled = progress.courses[course.id];
            const done = enrolled?.completedLessons.length ?? 0;
            const open = expandedId === `course-${course.id}`;
            return (
              <article
                key={course.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white">{course.title}</h3>
                    <p className="mt-1 text-sm text-white/55">{course.description}</p>
                    <p className="mt-2 text-xs text-white/45">
                      {course.lessons.length} lessons · {course.weeks} weeks · {course.creator}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!enrolled ? (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-teal-600"
                      onClick={() => {
                        enrollCourse(course.id);
                        refresh();
                        setExpandedId(`course-${course.id}`);
                      }}
                    >
                      Start course
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={() => setExpandedId(open ? null : `course-${course.id}`)}>
                      {open ? 'Hide lessons' : `Lessons (${done}/${course.lessons.length})`}
                    </Button>
                  )}
                </div>
                {open && enrolled && (
                  <ul className="mt-4 space-y-2 border-t pt-4">
                    {course.lessons.map((lesson) => {
                      const complete = enrolled.completedLessons.includes(lesson.id);
                      return (
                        <li key={lesson.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                          <span className="text-sm text-white/80">
                            {lesson.title} ({lesson.durationMin} min)
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            disabled={complete}
                            onClick={() => {
                              completeLesson(course.id, lesson.id);
                              refresh();
                            }}
                          >
                            {complete ? '✓' : 'Complete'}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      {tab === 'journeys' && (
        <div className="mt-6 space-y-4">
          {HABIT_JOURNEYS.map((journey) => {
            const enrolled = progress.journeys[journey.id];
            const done = enrolled?.completedDays.length ?? 0;
            const open = expandedId === `j-${journey.id}`;
            return (
              <article key={journey.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5">
                <div className="flex gap-3">
                  <span className="text-3xl">{journey.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white">{journey.title}</h3>
                    <p className="mt-1 text-sm text-white/55">{journey.description}</p>
                    <p className="mt-2 text-xs text-indigo-700">{journey.days}-day habit journey</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!enrolled ? (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500"
                      onClick={() => {
                        enrollJourney(journey.id);
                        refresh();
                        setExpandedId(`j-${journey.id}`);
                      }}
                    >
                      Begin journey
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={() => setExpandedId(open ? null : `j-${journey.id}`)}>
                      {open ? 'Hide steps' : `Steps (${done}/${journey.days})`}
                    </Button>
                  )}
                </div>
                {open && enrolled && (
                  <ul className="mt-4 space-y-2 border-t border-indigo-100 pt-4">
                    {journey.steps.map((step) => {
                      const complete = enrolled.completedDays.includes(step.day);
                      return (
                        <li key={step.day} className="rounded-xl bg-white/[0.06] px-3 py-2">
                          <p className="text-sm font-medium text-white">
                            Day {step.day}: {step.title}
                          </p>
                          <p className="text-xs text-white/55">{step.action}</p>
                          <Button
                            type="button"
                            size="sm"
                            className="mt-2"
                            disabled={complete}
                            onClick={() => {
                              completeJourneyDay(journey.id, step.day);
                              refresh();
                            }}
                          >
                            {complete ? 'Completed' : 'Mark done'}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      {tab === 'certificates' && (
        <div className="mt-6">
          {certificates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 py-14 text-center">
              <Award className="mx-auto size-12 text-amber-400" aria-hidden />
              <p className="mt-4 font-medium text-white/80">No certificates yet</p>
              <p className="mt-2 text-sm text-white/55">
                Complete a program, course, or habit journey to earn one.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((cert: Certificate) => (
                <div
                  key={cert.id}
                  className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm"
                >
                  <Award className="size-8 text-amber-600" aria-hidden />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-800">
                    Certificate of completion
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-white">{cert.title}</h3>
                  <p className="mt-2 text-xs text-white/55">
                    {cert.type} · {cert.creator} · {formatDate(cert.issuedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
