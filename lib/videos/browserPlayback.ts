/** Whether the URL/mime is likely to play in HTML5 video (MKV is often not). */
export function isLikelyWebPlayable(videoUrl?: string, mimeType?: string): boolean {
  const type = (mimeType || '').toLowerCase();
  if (type.includes('matroska') || type === 'video/x-matroska' || type === 'application/x-matroska') {
    return false;
  }
  const url = (videoUrl || '').toLowerCase().split('?')[0];
  if (url.endsWith('.mkv')) return false;
  return true;
}

export function webPlaybackHint(videoUrl?: string, mimeType?: string): string {
  if (isLikelyWebPlayable(videoUrl, mimeType)) {
    return 'If playback fails, re-export the video as MP4 (H.264) and upload again.';
  }
  return 'MKV and some formats do not play in web browsers. Convert to MP4 (H.264 + AAC) with HandBrake or VLC, then upload again.';
}
