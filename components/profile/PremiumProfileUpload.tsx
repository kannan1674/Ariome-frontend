'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  PROFILE_PHOTO_KEY,
  notifyProfilePhotoChanged,
} from '@/lib/profilePhoto';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

type PremiumProfileUploadProps = {
  initialUrl?: string | null;
  storageKey?: string;
  onSaved?: (dataUrl: string | null) => void;
  className?: string;
};

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extLabel(file: File) {
  const type = file.type.split('/')[1]?.toUpperCase();
  if (type === 'JPEG') return 'JPG';
  return type || 'IMG';
}

export function PremiumProfileUpload({
  initialUrl,
  storageKey = PROFILE_PHOTO_KEY,
  onSaved,
  className,
}: PremiumProfileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; kind: string } | null>(null);
  const [progress, setProgress] = useState(initialUrl ? 100 : 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPreview(saved);
        setProgress(100);
      } else if (initialUrl) {
        setPreview(initialUrl);
        setProgress(100);
      }
    } catch {
      /* ignore */
    }
  }, [initialUrl, storageKey]);

  const ringStyle = useMemo(
    () => ({
      background: `conic-gradient(#3b82f6 ${progress * 3.6}deg, rgba(226,232,240,0.9) 0deg)`,
    }),
    [progress],
  );

  const clearPending = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setFileMeta(null);
    setError(null);
    setBusy(false);
    setProgress(preview ? 100 : 0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onPick = (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 5MB or smaller.');
      return;
    }
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingUrl(url);
    setFileMeta({ name: file.name, size: file.size, kind: extLabel(file) });
    setProgress(0);
    setBusy(true);

    // Fake upload progress for premium UI feel
    let p = 0;
    const id = window.setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        window.clearInterval(id);
        setBusy(false);
      }
      setProgress(Math.min(100, Math.round(p)));
    }, 120);
  };

  const save = () => {
    if (!pendingFile || !pendingUrl || progress < 100) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      try {
        localStorage.setItem(storageKey, dataUrl);
      } catch {
        /* quota */
      }
      notifyProfilePhotoChanged(dataUrl);
      setPreview(dataUrl);
      onSaved?.(dataUrl);
      clearPending();
      setProgress(100);
    };
    reader.readAsDataURL(pendingFile);
  };

  const cancel = () => {
    clearPending();
  };

  const displayUrl = pendingUrl || preview;

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800">Upload Profile Photo</h3>
        <p className="mt-1 text-sm text-slate-500">Choose a photo that represents you.</p>
      </div>

      <div className="relative mx-auto mt-6 flex size-[148px] items-center justify-center">
        <div className="absolute inset-0 rounded-full p-[3px]" style={ringStyle}>
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                <FileImage className="size-10" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>
        {(busy || progress > 0) && (
          <span className="absolute bottom-1 left-1/2 z-[1] -translate-x-1/2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
            {progress}%
          </span>
        )}
      </div>

      {fileMeta ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
            <FileImage className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{fileMeta.name}</p>
            <p className="text-xs text-slate-500">
              {formatMb(fileMeta.size)} · {fileMeta.kind}
            </p>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Remove selected file"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-center text-xs font-medium text-red-500">{error}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={() => {
            if (pendingFile && progress >= 100) {
              save();
              return;
            }
            inputRef.current?.click();
          }}
          disabled={busy}
          className="h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] hover:from-sky-600 hover:to-blue-700"
        >
          {pendingFile && progress >= 100 ? 'Save photo' : 'Select Image'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={cancel}
          className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Button>
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-400">JPG, PNG, WEBP up to 5MB</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
