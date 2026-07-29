/** Grab a JPEG still from a video element (e.g. for upload thumbnail). */
export function captureVideoFrame(video: HTMLVideoElement, filename = 'thumbnail.jpg'): Promise<File | null> {
  if (!video.videoWidth || !video.videoHeight) return Promise.resolve(null);

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(video, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(new File([blob], filename, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.88,
    );
  });
}
