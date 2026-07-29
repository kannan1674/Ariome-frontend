'use client'

import { attachWatchTimeTracker } from '@/lib/videos/watchTime'
import {
  isLikelyWebPlayable,
  webPlaybackHint,
} from '@/lib/videos/browserPlayback'
import { useEffect, useRef, useState } from 'react'

type Props = {
  videoId: string
  src: string
  mimeType?: string
  className?: string
  autoPlay?: boolean
  playerKey?: string
}

export default function UploadVideoPlayer({
  videoId,
  src,
  mimeType,
  className,
  autoPlay = true,
  playerKey,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playbackError, setPlaybackError] = useState(false)
  const likelyPlayable = isLikelyWebPlayable(src, mimeType)

  useEffect(() => {
    setPlaybackError(false)
  }, [src, playerKey])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoId) return
    return attachWatchTimeTracker(videoId, el)
  }, [videoId, playerKey])

  return (
    <div className="relative h-full w-full">
      <video
        key={playerKey}
        ref={videoRef}
        src={src}
        controls={!playbackError}
        autoPlay={autoPlay && !playbackError}
        playsInline
        className={className}
        onError={() => setPlaybackError(true)}
      />
      {!likelyPlayable && !playbackError && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-amber-950/90 px-3 py-2 text-center text-[11px] leading-snug text-amber-100">
          {webPlaybackHint(src, mimeType)}
        </p>
      )}
      {playbackError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 px-6 text-center">
          <p className="text-base font-semibold text-white">Cannot play this file in the browser</p>
          <p className="max-w-md text-sm leading-relaxed text-white/65">
            {webPlaybackHint(src, mimeType)}
          </p>
        </div>
      )}
    </div>
  )
}
