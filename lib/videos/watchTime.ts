import { authenticatedFetch } from '@/lib/auth/authenticatedFetch';

const TICK_MS = 5_000;
const FLUSH_EVERY_SECONDS = 5;
const MAX_CHUNK_SECONDS = 60;

let flushActiveSession: (() => void) | null = null;

export function formatWatchTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export async function postWatchTime(videoId: string, seconds: number): Promise<void> {
  if (!videoId || seconds < 1) return;
  try {
    await authenticatedFetch(`/api/videos/${videoId}/watch-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds: Math.min(MAX_CHUNK_SECONDS, Math.round(seconds)) }),
    });
  } catch {
    /* best-effort */
  }
}

/** Flush any in-progress watch session (e.g. when closing the Explore viewer). */
export function flushActiveWatchTime() {
  flushActiveSession?.();
}

/** Tracks playback time via wall clock + media position. */
export function attachWatchTimeTracker(
  videoId: string,
  video: HTMLVideoElement,
): () => void {
  let playing = false;
  let lastWallMs = 0;
  let lastMediaTime = 0;
  let pendingSeconds = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const flush = () => {
    if (pendingSeconds < 1) return;
    const toSend = Math.min(MAX_CHUNK_SECONDS, Math.round(pendingSeconds));
    pendingSeconds -= toSend;
    void postWatchTime(videoId, toSend);
  };

  const flushNow = () => {
    accumulateWallTime();
    accumulateMediaTime();
    flush();
  };

  const accumulateWallTime = () => {
    if (!lastWallMs) return;
    const deltaSec = (Date.now() - lastWallMs) / 1000;
    lastWallMs = 0;
    if (deltaSec > 0) {
      pendingSeconds += Math.min(deltaSec, 15);
    }
  };

  const accumulateMediaTime = () => {
    if (video.paused || video.ended) return;
    const t = video.currentTime;
    if (lastMediaTime > 0) {
      const delta = t - lastMediaTime;
      if (delta > 0 && delta < 5) {
        pendingSeconds += delta;
      }
    }
    lastMediaTime = t;
  };

  const tick = () => {
    if (!playing) return;
    accumulateWallTime();
    accumulateMediaTime();
    lastWallMs = Date.now();
    if (pendingSeconds >= FLUSH_EVERY_SECONDS) {
      flush();
    }
  };

  const onPlay = () => {
    playing = true;
    lastWallMs = Date.now();
    lastMediaTime = video.currentTime;
    if (!intervalId) {
      intervalId = setInterval(tick, TICK_MS);
    }
  };

  const onPause = () => {
    if (!playing) return;
    playing = false;
    accumulateWallTime();
    accumulateMediaTime();
    flush();
    lastMediaTime = 0;
  };

  const onEnded = () => {
    playing = false;
    accumulateWallTime();
    accumulateMediaTime();
    flush();
    lastMediaTime = 0;
  };

  const onTimeUpdate = () => {
    if (!playing || video.paused) return;
    accumulateMediaTime();
    if (pendingSeconds >= FLUSH_EVERY_SECONDS) {
      flush();
    }
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('playing', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('ended', onEnded);
  video.addEventListener('timeupdate', onTimeUpdate);

  flushActiveSession = flushNow;

  const detach = () => {
    if (intervalId) clearInterval(intervalId);
    video.removeEventListener('play', onPlay);
    video.removeEventListener('playing', onPlay);
    video.removeEventListener('pause', onPause);
    video.removeEventListener('ended', onEnded);
    video.removeEventListener('timeupdate', onTimeUpdate);
    if (flushActiveSession === flushNow) {
      flushActiveSession = null;
    }
    if (playing) {
      playing = false;
      accumulateWallTime();
      accumulateMediaTime();
    }
    flush();
  };

  return detach;
}
