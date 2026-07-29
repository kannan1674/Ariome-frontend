'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(
    (seconds: number) => {
      clear();
      setRemaining(seconds);
      setRunning(false);
      setFinished(false);
    },
    [clear],
  );

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setRunning(true);
    setFinished(false);
  }, [remaining]);

  const pause = useCallback(() => {
    setRunning(false);
    clear();
  }, [clear]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clear();
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  useEffect(() => () => clear(), [clear]);

  return { remaining, running, finished, start, pause, reset, setRemaining };
}

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
