/** 2 GB — keep in sync with Backend/middleware/uploadMiddleware.js */
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

export const MAX_VIDEO_LABEL = '2 GB';

export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
export const MAX_THUMBNAIL_LABEL = '5 MB';

/** How often Explore refetches teacher videos when the tab is visible */
export const TEACHER_VIDEOS_POLL_MS = 60_000;

/** Keep in sync with Backend/middleware/uploadMiddleware.js */
export const VIDEO_UPLOAD_ACCEPT =
  'video/mp4,video/webm,video/quicktime,video/ogg,video/x-matroska,video/x-msvideo,video/avi,.mp4,.webm,.mov,.mkv,.avi,.ogg,.m4v';

export const VIDEO_UPLOAD_FORMATS_LABEL = 'MP4, WebM, MOV, MKV, AVI, or OGG';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'] as const;

const VIDEO_MIME_PREFIXES = ['video/', 'application/x-matroska'];

/** Client-side check when the browser reports a generic or missing MIME type. */
export function isAllowedVideoFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  const type = (file.type || '').toLowerCase();
  if (!type || type === 'application/octet-stream') return false;
  return VIDEO_MIME_PREFIXES.some((p) => type === p || type.startsWith('video/'));
}
