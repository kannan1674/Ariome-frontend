'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BREATHING_PATTERNS,
  getBreathingPattern,
  getBreathingVoiceCue,
  getBreathingVoiceIntro,
  phaseLabel,
} from '@/lib/wellness/breathingPatterns';
import { recordPracticeSession } from '@/lib/wellness/streaks';
import {
  isBreathingVoiceSupported,
  speakBreathingCue,
  stopBreathingVoice,
} from '@/lib/wellness/breathingVoice';
import type { BreathingPatternId } from '@/lib/wellness/types';
import { Volume2, VolumeX, Wind } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle' | 'done';

type Props = { onSessionComplete?: () => void };

export default function BreathingAnimation({ onSessionComplete }: Props) {
  const [patternId, setPatternId] = useState<BreathingPatternId>('box');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycle, setCycle] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [scale, setScale] = useState(0.65);
  const [voiceOn, setVoiceOn] = useState(true);
  const timerRef = useRef<number | null>(null);
  const voiceOnRef = useRef(voiceOn);
  const patternIdRef = useRef(patternId);

  const pattern = getBreathingPattern(patternId);
  const voiceSupported = isBreathingVoiceSupported();

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    patternIdRef.current = patternId;
  }, [patternId]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runPhase = useCallback(
    (p: Phase, duration: number, next: () => void) => {
      if (duration <= 0) {
        next();
        return;
      }
      setPhase(p);
      setSecondsLeft(duration);
      if (p === 'inhale') setScale(1);
      if (p === 'exhale') setScale(0.65);
      if (p === 'holdIn' || p === 'holdOut') setScale(p === 'holdIn' ? 1 : 0.65);

      if (
        voiceOnRef.current &&
        isBreathingVoiceSupported() &&
        (p === 'inhale' || p === 'holdIn' || p === 'exhale' || p === 'holdOut')
      ) {
        speakBreathingCue(getBreathingVoiceCue(p, patternIdRef.current), { rate: 0.92 });
      }

      let left = duration;
      clearTimer();
      timerRef.current = window.setInterval(() => {
        left -= 1;
        setSecondsLeft(left);
        if (left <= 0) {
          clearTimer();
          next();
        }
      }, 1000);
    },
    [clearTimer],
  );

  const startSession = useCallback(() => {
    setRunning(true);
    setCycle(0);
    const p = getBreathingPattern(patternId);

    const runCycle = (cycleIndex: number) => {
      if (cycleIndex >= p.cycles) {
        setPhase('done');
        setRunning(false);
        if (voiceOnRef.current && isBreathingVoiceSupported()) {
          speakBreathingCue('Well done. Notice how calm your body feels.', { rate: 0.88 });
        }
        recordPracticeSession();
        onSessionComplete?.();
        return;
      }
      setCycle(cycleIndex + 1);
      runPhase('inhale', p.inhale, () =>
        runPhase('holdIn', p.holdIn, () =>
          runPhase('exhale', p.exhale, () =>
            runPhase('holdOut', p.holdOut, () => runCycle(cycleIndex + 1)),
          ),
        ),
      );
    };

    const begin = () => runCycle(0);

    if (voiceOnRef.current && isBreathingVoiceSupported()) {
      speakBreathingCue(getBreathingVoiceIntro(patternId), {
        rate: 0.88,
        onEnd: begin,
      });
    } else {
      begin();
    }
  }, [patternId, runPhase, onSessionComplete]);

  const stop = useCallback(() => {
    stopBreathingVoice();
    clearTimer();
    setRunning(false);
    setPhase('idle');
    setScale(0.65);
    setSecondsLeft(0);
    setCycle(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopBreathingVoice();
    };
  }, [clearTimer]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-gray-100/80">
      <div className="flex items-center gap-2">
        <Wind className="size-5 text-teal-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Breathing animations</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">Follow the circle — expand on inhale, soften on exhale.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {BREATHING_PATTERNS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={running}
            onClick={() => setPatternId(p.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              patternId === p.id
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              running && 'opacity-50',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-gray-500">{pattern.description}</p>

      <label
        className={cn(
          'mt-3 flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-700',
          (!voiceSupported || running) && 'cursor-not-allowed opacity-60',
        )}
      >
        <input
          type="checkbox"
          checked={voiceOn}
          disabled={!voiceSupported || running}
          onChange={(e) => setVoiceOn(e.target.checked)}
          className="size-4 rounded border-gray-300 text-teal-600"
        />
        {voiceOn ? (
          <Volume2 className="size-4 text-teal-600" aria-hidden />
        ) : (
          <VolumeX className="size-4 text-gray-400" aria-hidden />
        )}
        Voice guidance
        {!voiceSupported && (
          <span className="text-xs text-gray-400">(not supported in this browser)</span>
        )}
      </label>

      <BreathingCircle
        scale={scale}
        phase={phase}
        secondsLeft={secondsLeft}
        cycle={cycle}
        totalCycles={pattern.cycles}
      />

      <div className="mt-6 flex justify-center gap-3">
        {!running ? (
          <Button type="button" onClick={startSession} className="rounded-full bg-teal-600 px-6">
            {phase === 'done' ? 'Practice again' : 'Start breathing'}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stop} className="rounded-full">
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}


function BreathingCircle({
  scale,
  phase,
  secondsLeft,
  cycle,
  totalCycles,
}: {
  scale: number;
  phase: Phase;
  secondsLeft: number;
  cycle: number;
  totalCycles: number;
}) {
  return (
    <div className="relative mx-auto mt-8 flex h-52 flex-col items-center justify-center">
      <div
        className="rounded-full bg-gradient-to-br from-teal-400/40 via-teal-500/30 to-indigo-500/40 shadow-inner ring-2 ring-teal-200/60 transition-transform duration-[4000ms] ease-in-out"
        style={{
          width: `${scale * 140}px`,
          height: `${scale * 140}px`,
        }}
      />
      <p className="absolute mt-36 text-center">
        <span className="block text-lg font-semibold text-gray-900">
          {phase === 'idle' ? 'Ready' : phase === 'done' ? 'Complete' : phaseLabel(phase)}
        </span>
        {phase !== 'idle' && phase !== 'done' && (
          <span className="mt-1 block text-3xl font-bold tabular-nums text-teal-600">{secondsLeft}</span>
        )}
        {runningLabel(cycle, totalCycles, phase)}
      </p>
    </div>
  );
}

function runningLabel(cycle: number, totalCycles: number, phase: Phase) {
  if (phase === 'idle' || phase === 'done') return null;
  return (
    <span className="mt-1 block text-xs text-gray-500">
      Cycle {cycle} of {totalCycles}
    </span>
  );
}
