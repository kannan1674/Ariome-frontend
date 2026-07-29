import { captureVideoFrame } from './captureFrame';

/** Read duration from a local video file before upload. */
export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;
      cleanup();
      resolve(duration > 0 ? duration : 0);
    };

    video.onerror = () => {
      cleanup();
      resolve(0);
    };

    video.src = url;
  });
}

/** Resolve duration from a remote video URL (for older uploads missing DB duration). */
export function getVideoDurationFromUrl(videoUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;
      cleanup();
      resolve(duration > 0 ? duration : 0);
    };

    video.onerror = () => {
      cleanup();
      resolve(0);
    };

    video.src = videoUrl;
  });
}

/**
 * Build a JPEG thumbnail from a local video (works for many MKV files in Chrome).
 * Returns null if the browser cannot decode the file.
 */
export function generateThumbnailFromVideoFile(
  file: File,
  timeoutMs = 45_000,
): Promise<File | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let settled = false;
    const finish = (result: File | null) => {
      if (settled) return;
      settled = true;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    const grabFrame = async () => {
      const frame = await captureVideoFrame(video, 'thumbnail.jpg');
      window.clearTimeout(timer);
      finish(frame);
    };

    video.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };

    video.onloadeddata = () => {
      const seekTo =
        Number.isFinite(video.duration) && video.duration > 1
          ? Math.min(8, Math.max(1, video.duration * 0.05))
          : 0;
      if (seekTo > 0) {
        video.currentTime = seekTo;
      } else {
        void grabFrame();
      }
    };

    video.onseeked = () => {
      void grabFrame();
    };

    video.src = url;
  });
}
