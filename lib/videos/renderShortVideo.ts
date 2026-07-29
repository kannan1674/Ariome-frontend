export type ShortVideoInput = {
  title: string;
  hook: string;
  script: string;
  mood: string;
};

const MOOD_THEMES: Record<string, { from: string; to: string; accent: string }> = {
  Peaceful: { from: '#0f766e', to: '#134e4a', accent: '#99f6e4' },
  Grateful: { from: '#b45309', to: '#78350f', accent: '#fde68a' },
  Hopeful: { from: '#0369a1', to: '#1e3a8a', accent: '#7dd3fc' },
  Joyful: { from: '#db2777', to: '#9d174d', accent: '#fbcfe8' },
  Reflective: { from: '#6d28d9', to: '#312e81', accent: '#ddd6fe' },
  Anxious: { from: '#475569', to: '#1e293b', accent: '#cbd5e1' },
};

function pickMimeType() {
  const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

function splitCaptions(hook: string, script: string) {
  const parts = `${hook}. ${script}`
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [hook || script || 'Take a gentle breath.'];
}

export async function renderShortVideo(
  input: ShortVideoInput,
  audioBlob: Blob | null,
  onProgress?: (message: string) => void,
): Promise<{ file: File; durationSeconds: number; thumbnail: File | null }> {
  const WIDTH = 720;
  const HEIGHT = 1280;
  const theme = MOOD_THEMES[input.mood] || MOOD_THEMES.Peaceful;
  const captions = splitCaptions(input.hook, input.script);

  onProgress?.('Preparing canvas…');

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  let audioEl: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;
  let durationSec = Math.min(
    90,
    Math.max(12, Math.ceil((input.hook.length + input.script.length) / 14)),
  );

  if (audioBlob && audioBlob.size > 0) {
    onProgress?.('Loading AI voice…');
    audioUrl = URL.createObjectURL(audioBlob);
    audioEl = new Audio(audioUrl);
    await new Promise<void>((resolve, reject) => {
      audioEl!.onloadedmetadata = () => resolve();
      audioEl!.onerror = () => reject(new Error('Could not load generated voice'));
    });
    if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
      durationSec = Math.min(90, audioEl.duration + 0.5);
    }
  }

  const drawFrame = (timeSec: number) => {
    const pulse = 0.04 * Math.sin(timeSec * 2);
    const grd = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    grd.addColorStop(0, theme.from);
    grd.addColorStop(0.55 + pulse, theme.to);
    grd.addColorStop(1, '#0f172a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText(input.mood.toUpperCase(), WIDTH / 2, 72);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px system-ui, sans-serif';
    wrapText(ctx, input.title, WIDTH / 2, 120, WIDTH - 96, 46);

    const progress = Math.min(1, timeSec / durationSec);
    const capIndex = Math.min(captions.length - 1, Math.floor(progress * captions.length));
    const caption = captions[capIndex] ?? '';

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '500 34px system-ui, sans-serif';
    wrapText(ctx, caption, WIDTH / 2, HEIGHT * 0.52, WIDTH - 88, 42);

    ctx.font = '500 18px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('Ariome', WIDTH / 2, HEIGHT - 48);
  };

  onProgress?.('Rendering video…');

  const fps = 24;
  const canvasStream = canvas.captureStream(fps);
  let combinedStream: MediaStream = canvasStream;
  let audioContext: AudioContext | null = null;

  if (audioEl) {
    audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audioEl);
    const dest = audioContext.createMediaStreamDestination();
    source.connect(dest);
    combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);
  }

  const mime = pickMimeType();
  const recorder = mime
    ? new MediaRecorder(combinedStream, { mimeType: mime })
    : new MediaRecorder(combinedStream);
  const chunks: Blob[] = [];

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Video encoding failed'));
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
    };
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(400);

  const playPromise = audioEl?.play();

  await new Promise<void>((resolve) => {
    const started = performance.now();
    const tick = () => {
      const elapsed = audioEl ? audioEl.currentTime : (performance.now() - started) / 1000;
      drawFrame(elapsed);

      const done = audioEl
        ? audioEl.ended || audioEl.currentTime >= durationSec - 0.05
        : elapsed >= durationSec;

      if (done) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  if (audioEl) {
    audioEl.pause();
  }

  recorder.stop();
  combinedStream.getTracks().forEach((t) => t.stop());
  await playPromise?.catch(() => undefined);
  await audioContext?.close().catch(() => undefined);
  if (audioUrl) URL.revokeObjectURL(audioUrl);

  const blob = await blobPromise;
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  const file = new File([blob], `ariome-short-${Date.now()}.${ext}`, {
    type: blob.type || 'video/webm',
  });

  drawFrame(durationSec / 2);
  const thumbBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.88);
  });
  const thumbnail = thumbBlob
    ? new File([thumbBlob], `short-thumb-${Date.now()}.jpg`, { type: 'image/jpeg' })
    : null;

  return {
    file,
    durationSeconds: Math.max(1, Math.round(durationSec)),
    thumbnail,
  };
}
