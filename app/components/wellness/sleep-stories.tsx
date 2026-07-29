'use client';

import { cn } from '@/lib/utils';
import { recordPracticeSession } from '@/lib/wellness/streaks';
import { SLEEP_STORIES, getSleepStory, type SleepStory } from '@/lib/wellness/sleepStories';
import { BookOpen, ChevronLeft, ChevronRight, Moon, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function SleepStories({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const [storyId, setStoryId] = useState(SLEEP_STORIES[0].id);
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);

  const story = getSleepStory(storyId);
  const paragraph = story.paragraphs[step];
  const atEnd = step >= story.paragraphs.length - 1;

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setListening(false);
  }, []);

  useEffect(() => {
    setStep(0);
    stopSpeech();
  }, [storyId, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const speakStory = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stopSpeech();
    const text = story.paragraphs.join(' ');
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.82;
    utter.pitch = 0.95;
    utter.onend = () => setListening(false);
    utter.onerror = () => setListening(false);
    setListening(true);
    window.speechSynthesis.speak(utter);
  };

  const finishStory = () => {
    recordPracticeSession();
    onSessionComplete?.();
    stopSpeech();
  };

  const selectStory = (s: SleepStory) => {
    setStoryId(s.id);
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-5 shadow-sm ring-1 ring-indigo-100/60">
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-indigo-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Sleep stories</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">Calm narratives to ease into rest. Read or listen aloud.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {SLEEP_STORIES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => selectStory(s)}
            className={cn(
              'shrink-0 rounded-xl border px-3 py-2 text-left transition',
              storyId === s.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
            )}
          >
            <p className="text-xs font-semibold">{s.title}</p>
            <p className="text-[10px] text-gray-500">{s.durationMin} min</p>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-indigo-100/80 bg-white/90 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Part {step + 1} of {story.paragraphs.length}
            </p>
            <h4 className="mt-1 font-serif text-lg font-semibold text-gray-900">{story.title}</h4>
          </div>
          <Moon className="size-5 shrink-0 text-indigo-300" aria-hidden />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-800 sm:text-base">{paragraph}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((n) => Math.max(0, n - 1))}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
          {!atEnd ? (
            <button
              type="button"
              onClick={() => setStep((n) => n + 1)}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishStory}
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Mark story complete
            </button>
          )}
          <button
            type="button"
            onClick={listening ? stopSpeech : speakStory}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-50"
          >
            {listening ? (
              <>
                <VolumeX className="size-4" aria-hidden />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="size-4" aria-hidden />
                Listen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
