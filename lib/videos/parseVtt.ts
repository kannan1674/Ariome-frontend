export type VttCue = {
  start: number;
  end: number;
  text: string;
};

function parseVttTime(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length === 3) {
    const [h, m, rest] = parts;
    const [s, ms] = rest.split('.');
    return (
      Number(h) * 3600 +
      Number(m) * 60 +
      Number(s) +
      (Number(ms || 0) || 0) / 1000
    );
  }
  if (parts.length === 2) {
    const [m, rest] = parts;
    const [s, ms] = rest.split('.');
    return Number(m) * 60 + Number(s) + (Number(ms || 0) || 0) / 1000;
  }
  return 0;
}

/** Parse a WebVTT file into timed cues. */
export function parseVttCues(raw: string): VttCue[] {
  const normalized = raw.replace(/\r/g, '').trim();
  if (!normalized) return [];

  const cues: VttCue[] = [];
  const blocks = normalized.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');
    const timing = lines.find((l) => l.includes('-->'));
    if (!timing) continue;
    const [startRaw, endRaw] = timing.split('-->').map((s) => s.trim());
    const text = lines
      .slice(lines.indexOf(timing) + 1)
      .join('\n')
      .trim();
    if (!text) continue;
    cues.push({
      start: parseVttTime(startRaw),
      end: parseVttTime(endRaw),
      text,
    });
  }

  return cues;
}

/** Legacy: all cue text joined (used when timing is not needed). */
export function parseVttCueText(raw: string): string {
  const cues = parseVttCues(raw);
  if (cues.length > 0) return cues.map((c) => c.text).join('\n').trim();
  return raw.replace(/^WEBVTT\s*/i, '').trim();
}

export async function fetchVttCues(url: string): Promise<VttCue[]> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!res.ok) return [];
    const raw = await res.text();
    return parseVttCues(raw);
  } catch {
    return [];
  }
}

export async function fetchVttText(url: string): Promise<string | null> {
  const cues = await fetchVttCues(url);
  if (cues.length > 0) return cues.map((c) => c.text).join('\n').trim();
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    return parseVttCueText(await res.text()) || null;
  } catch {
    return null;
  }
}

/** Stretch placeholder cues (e.g. title-only) across the real video length. */
export function normalizeCuesForDuration(
  cues: VttCue[],
  videoDurationSeconds?: number,
): VttCue[] {
  const dur = Number(videoDurationSeconds);
  if (!cues.length || !Number.isFinite(dur) || dur <= 0) return cues;

  if (cues.length === 1 && dur > cues[0].end + 1) {
    return [{ ...cues[0], end: dur }];
  }

  const last = cues[cues.length - 1];
  if (cues.length <= 2 && dur > last.end + 1) {
    return cues.map((c, i) =>
      i === cues.length - 1 ? { ...c, end: Math.max(c.end, dur) } : c,
    );
  }

  return cues;
}

export function cueAtTime(
  cues: VttCue[],
  timeSeconds: number,
  videoDurationSeconds?: number,
): string | null {
  const normalized = normalizeCuesForDuration(cues, videoDurationSeconds);
  const t = Math.max(0, timeSeconds);
  const hit = normalized.find((c) => t >= c.start && t < c.end);
  return hit?.text ?? null;
}
