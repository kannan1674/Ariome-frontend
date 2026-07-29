/** Formats seconds as M:SS or H:MM:SS for display on video cards. */
export function formatDuration(totalSeconds: number | undefined | null): string {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  if (s <= 0) return '';

  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
