'use client'

import { attachWatchTimeTracker } from '@/lib/videos/watchTime'
import type { TeacherVideo, VideoSubtitleTrack } from '@/lib/videos/types'
import { resolveSubtitleTracks } from '@/lib/videos/subtitleTracks'
import {
  cueAtTime,
  fetchVttCues,
  normalizeCuesForDuration,
  type VttCue,
} from '@/lib/videos/parseVtt'
import {
  isLikelyWebPlayable,
  webPlaybackHint,
} from '@/lib/videos/browserPlayback'
import { cn } from '@/lib/utils'
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings2,
  RotateCcw,
  RotateCw,
  Subtitles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function isHlsSource(url: string) {
  const lower = url.toLowerCase().split('?')[0]
  return lower.includes('.m3u8') || lower.includes('/uploads/hls/')
}

type Props = {
  videoId: string
  src: string
  mimeType?: string
  subtitleTracks?: VideoSubtitleTrack[]
  transcribeStatus?: TeacherVideo['transcribeStatus']
  transcribeError?: string
  playerKey?: string
  /** Request browser fullscreen on the player stage when mounted */
  enterFullscreenOnMount?: boolean
  className?: string
}

type QualityOption = {
  id: string
  label: string
  height: number
  bandwidth: number
}

type SubtitleOption = {
  id: string
  label: string
  language: string
}

export default function CinematicVideoPlayer({
  videoId,
  src,
  mimeType,
  subtitleTracks = [],
  transcribeStatus,
  transcribeError,
  playerKey,
  enterFullscreenOnMount = true,
  className,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const subtitleContainerRef = useRef<HTMLDivElement>(null)
  const shakaPlayerRef = useRef<any>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playbackError, setPlaybackError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Cannot play in browser')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([])
  const [selectedQuality, setSelectedQuality] = useState('auto')
  const [selectedSubtitle, setSelectedSubtitle] = useState('off')
  const [subtitleCues, setSubtitleCues] = useState<VttCue[]>([])
  const likelyPlayable = isLikelyWebPlayable(src, mimeType)

  const resolvedSubtitleTracks = useMemo(
    () => resolveSubtitleTracks(videoId, subtitleTracks),
    [videoId, subtitleTracks],
  )

  const menuSubtitleOptions = useMemo<SubtitleOption[]>(
    () =>
      resolvedSubtitleTracks.map((track) => ({
        id: `lang:${track.language}`,
        label: track.label,
        language: track.language,
      })),
    [resolvedSubtitleTracks],
  )

  const bumpControls = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3200)
  }, [playing])

  useEffect(() => {
    setPlaybackError(false)
    setErrorMessage('Cannot play in browser')
    setCurrentTime(0)
    setDuration(0)
    setQualityOptions([])
    setSelectedQuality('auto')
    setSelectedSubtitle('off')
    setSubtitleCues([])
  }, [src, playerKey, resolvedSubtitleTracks])

  const activeSubtitleText = useMemo(() => {
    if (selectedSubtitle === 'off' || subtitleCues.length === 0) return null
    return cueAtTime(subtitleCues, currentTime, duration)
  }, [subtitleCues, currentTime, duration, selectedSubtitle])

  const syncNativeQuality = useCallback(() => {
    const el = videoRef.current
    if (!el?.videoHeight) return
    const h = el.videoHeight
    setQualityOptions([{ id: 'source', label: `${h}p`, height: h, bandwidth: 0 }])
    setSelectedQuality('source')
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoId) return
    return attachWatchTimeTracker(videoId, el)
  }, [videoId, playerKey])

  const syncTrackState = useCallback(() => {
    const player = shakaPlayerRef.current
    if (!player) return

    const variants = (player.getVariantTracks?.() || []) as Array<{
      id: number
      height?: number
      bandwidth?: number
      active?: boolean
    }>

    const normalized = variants
      .filter((v) => Number(v.height) > 0)
      .map((v) => ({
        id: String(v.id),
        label: `${v.height}p`,
        height: Number(v.height || 0),
        bandwidth: Number(v.bandwidth || 0),
        active: Boolean(v.active),
      }))
      .sort((a, b) => b.height - a.height || b.bandwidth - a.bandwidth)

    const dedupMap = new Map<string, QualityOption>()
    for (const v of normalized) {
      const key = `${v.height}`
      if (!dedupMap.has(key)) {
        dedupMap.set(key, {
          id: v.id,
          label: v.label,
          height: v.height,
          bandwidth: v.bandwidth,
        })
      }
    }

    let options = Array.from(dedupMap.values()).sort((a, b) => b.height - a.height)
    if (options.length === 0) {
      const el = videoRef.current
      const h = el?.videoHeight
      if (h && h > 0) {
        options = [
          {
            id: 'source',
            label: `${h}p (source)`,
            height: h,
            bandwidth: 0,
          },
        ]
      }
    }
    setQualityOptions(options)

    const abrEnabled = Boolean(player.getConfiguration?.().abr?.enabled)
    if (abrEnabled) {
      setSelectedQuality('auto')
    } else {
      const activeTrack = normalized.find((v) => v.active)
      setSelectedQuality(activeTrack ? String(activeTrack.id) : 'auto')
    }

    const texts = (player.getTextTracks?.() || []) as Array<{
      id: number
      language?: string
      label?: string
      kind?: string
      active?: boolean
    }>
    const subtitlesOn = Boolean(player.isTextTrackVisible?.())
    if (!subtitlesOn) {
      setSelectedSubtitle('off')
    } else {
      const activeText = texts.find((t) => t.active)
      if (activeText?.language) {
        setSelectedSubtitle(`lang:${activeText.language}`)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const el = videoRef.current
    if (!el) return

    const useShaka = isHlsSource(src)

    async function destroyShaka() {
      const player = shakaPlayerRef.current
      shakaPlayerRef.current = null
      if (player) {
        await player.destroy?.()
      }
    }

    async function initNative() {
      const video = videoRef.current
      if (!video) return
      await destroyShaka()
      video.removeAttribute('src')
      video.load()
      video.src = src
      video.load()
      setPlaybackError(false)
      setQualityOptions([])
      setSelectedQuality('auto')
      if (!cancelled) {
        try {
          await video.play()
        } catch {
          /* autoplay may be blocked until user taps play */
        }
      }
    }

    async function initShaka() {
      try {
        const module = await import('shaka-player')
        const shaka = (module as any).default ?? module
        shaka.polyfill?.installAllPolyfills?.()

        if (!shaka.Player?.isBrowserSupported?.()) {
          throw new Error('Shaka not supported')
        }

        await destroyShaka()
        const player = new shaka.Player(el)
        shakaPlayerRef.current = player

        const configure: Record<string, unknown> = {
          abr: { enabled: true },
          streaming: { bufferingGoal: 20 },
        }
        const container = subtitleContainerRef.current
        if (container && shaka.text?.UITextDisplayer) {
          configure.textDisplayFactory = () =>
            new shaka.text.UITextDisplayer(el, container)
        }
        player.configure(configure)

        const onTracksChanged = () => {
          if (!cancelled) syncTrackState()
        }
        const onShakaError = (event: any) => {
          if (cancelled) return
          const detail = event?.detail
          console.warn('[player] Shaka error, falling back to native', detail)
          void initNative()
        }

        player.addEventListener('trackschanged', onTracksChanged)
        player.addEventListener('variantchanged', onTracksChanged)
        player.addEventListener('textchanged', onTracksChanged)
        player.addEventListener('error', onShakaError)

        await player.load(src)
        if (!cancelled) syncTrackState()
      } catch (err) {
        console.warn('[player] Shaka unavailable, using native playback', err)
        if (!cancelled) await initNative()
      }
    }

    setPlaybackError(false)
    if (useShaka) {
      void initShaka()
    } else {
      void initNative()
    }

    return () => {
      cancelled = true
      void destroyShaka()
      el.removeAttribute('src')
      el.load()
    }
  }, [src, playerKey, syncTrackState, syncNativeQuality])

  useEffect(() => {
    const el = videoRef.current
    if (!el || isHlsSource(src)) return
    const onMeta = () => syncNativeQuality()
    el.addEventListener('loadedmetadata', onMeta)
    return () => el.removeEventListener('loadedmetadata', onMeta)
  }, [src, playerKey, syncNativeQuality])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.volume = volume
    el.muted = muted
  }, [volume, muted])

  useEffect(() => {
    if (!enterFullscreenOnMount) return
    const node = stageRef.current
    if (!node) return
    const t = window.setTimeout(() => {
      void node.requestFullscreen?.().catch(() => {
        /* user gesture / policy may block; stage still fills dialog */
      })
    }, 150)
    return () => window.clearTimeout(t)
  }, [enterFullscreenOnMount, playerKey])

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    bumpControls()
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [bumpControls, playing])

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el || playbackError) return
    if (el.paused) {
      void el.play()
    } else {
      el.pause()
    }
    bumpControls()
  }, [playbackError, bumpControls])

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const el = videoRef.current
      if (!el || playbackError) return
      const max = Number.isFinite(el.duration) ? el.duration : 0
      const next = Math.min(max, Math.max(0, el.currentTime + deltaSeconds))
      el.currentTime = next
      setCurrentTime(next)
      bumpControls()
    },
    [playbackError, bumpControls],
  )

  const toggleFullscreen = useCallback(async () => {
    const node = stageRef.current
    if (!node) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await node.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
    bumpControls()
  }, [bumpControls])

  const applyQuality = useCallback(
    (id: string) => {
      const player = shakaPlayerRef.current
      if (!player) return
      if (id === 'auto') {
        player.configure({ abr: { enabled: true } })
        setSelectedQuality('auto')
        bumpControls()
        return
      }
      if (id === 'source') {
        bumpControls()
        return
      }
      const target = (player.getVariantTracks?.() || []).find(
        (t: any) => String(t.id) === id,
      )
      if (!target) return
      player.configure({ abr: { enabled: false } })
      player.selectVariantTrack?.(target, true)
      setSelectedQuality(id)
      bumpControls()
    },
    [bumpControls],
  )

  const applySubtitle = useCallback(
    async (id: string) => {
      if (id === 'off') {
        setSubtitleCues([])
        const player = shakaPlayerRef.current
        try {
          player?.selectTextTrack?.(null)
        } catch {
          player?.setTextTrackVisibility?.(false)
        }
        setSelectedSubtitle('off')
        bumpControls()
        return
      }

      const lang = id.startsWith('lang:') ? id.slice(5) : id
      const meta = resolvedSubtitleTracks.find((t) => t.language === lang)
      if (!meta?.url) return

      const cues = await fetchVttCues(meta.url)
      const el = videoRef.current
      const videoDur = el?.duration && Number.isFinite(el.duration) ? el.duration : duration
      setSubtitleCues(normalizeCuesForDuration(cues, videoDur))

      const player = shakaPlayerRef.current
      if (player) {
        let shakaTrack = (player.getTextTracks?.() || []).find(
          (t: any) => t.language === lang,
        )
        if (!shakaTrack) {
          try {
            if (player.addTextTrackAsync) {
              await player.addTextTrackAsync(
                meta.url,
                lang,
                'subtitle',
                meta.label,
                'text/vtt',
              )
            } else {
              player.addTextTrack(meta.url, lang, 'subtitle', meta.label, 'text/vtt')
            }
          } catch {
            /* overlay still shows captions */
          }
          shakaTrack = (player.getTextTracks?.() || []).find(
            (t: any) => t.language === lang,
          )
        }
        if (shakaTrack) {
          player.selectTextTrack?.(shakaTrack)
          player.setTextTrackVisibility?.(true)
          player.getTextDisplayer?.()?.setTextVisibility?.(true)
        }
      }

      setSelectedSubtitle(id)
      bumpControls()
    },
    [bumpControls, resolvedSubtitleTracks, duration],
  )

  useEffect(() => {
    if (selectedSubtitle === 'off' || !duration) return
    setSubtitleCues((prev) => {
      if (!prev.length) return prev
      const next = normalizeCuesForDuration(prev, duration)
      if (next.length === prev.length && next[next.length - 1]?.end === prev[prev.length - 1]?.end) {
        return prev
      }
      return next
    })
  }, [duration, selectedSubtitle])

  const onScrub = (e: MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
    setCurrentTime(el.currentTime)
    bumpControls()
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const currentQualityLabel = useMemo(() => {
    if (selectedQuality === 'auto') return 'Auto'
    return qualityOptions.find((q) => q.id === selectedQuality)?.label || 'Quality'
  }, [qualityOptions, selectedQuality])

  const currentSubtitleLabel = useMemo(() => {
    if (selectedSubtitle === 'off') return 'Sub: Off'
    const hit = menuSubtitleOptions.find((s) => s.id === selectedSubtitle)
    return hit ? `Sub: ${hit.label}` : 'Subtitles'
  }, [selectedSubtitle, menuSubtitleOptions])

  return (
    <div
      ref={stageRef}
      className={cn(
        'group/player relative h-full w-full overflow-hidden bg-black',
        className,
      )}
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
      onClick={bumpControls}
    >
      <video
        key={playerKey}
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
        onClick={(e) => {
          e.stopPropagation()
          togglePlay()
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
        onVolumeChange={() => {
          const el = videoRef.current
          if (!el) return
          setVolume(el.volume)
          setMuted(el.muted)
        }}
        onError={() => {
          setPlaybackError(true)
          setErrorMessage('Cannot play this video in your browser')
        }}
      />

      <div
        ref={subtitleContainerRef}
        className="pointer-events-none absolute inset-0 z-[25]"
        aria-hidden
      />

      {activeSubtitleText && selectedSubtitle !== 'off' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[28] flex justify-center px-6 sm:bottom-28">
          <p className="max-w-3xl rounded-lg bg-black/80 px-4 py-2.5 text-center text-sm font-medium leading-relaxed text-white shadow-xl ring-1 ring-white/10 sm:text-base">
            {activeSubtitleText}
          </p>
        </div>
      )}

      {!likelyPlayable && !playbackError && (
        <p className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-amber-950/90 px-4 py-2 text-center text-[11px] text-amber-100">
          {webPlaybackHint(src, mimeType)}
        </p>
      )}

      {playbackError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/95 px-6 text-center">
          <p className="text-lg font-semibold text-white">{errorMessage}</p>
          <p className="max-w-md text-sm text-white/60">
            {webPlaybackHint(src, mimeType)}
          </p>
        </div>
      )}

      {buffering && !playbackError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <Loader2 className="size-12 animate-spin text-white/80" />
        </div>
      )}

      {!playbackError && (
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5 transition-opacity duration-300 sm:gap-8',
            showControls ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seekBy(-10)
            }}
            className="pointer-events-auto flex size-14 flex-col items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:scale-105 hover:bg-black/60 sm:size-16"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="size-7 sm:size-8" strokeWidth={1.75} />
            <span className="mt-0.5 text-[11px] font-bold tabular-nums sm:text-xs">10</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="pointer-events-auto flex size-20 items-center justify-center rounded-full bg-black/50 text-white ring-2 ring-white/30 backdrop-blur-sm transition hover:scale-105 hover:bg-black/65 sm:size-[5.5rem]"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause className="size-10 fill-white sm:size-11" />
            ) : (
              <Play className="ml-1 size-10 fill-white sm:size-11" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seekBy(10)
            }}
            className="pointer-events-auto flex size-14 flex-col items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:scale-105 hover:bg-black/60 sm:size-16"
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="size-7 sm:size-8" strokeWidth={1.75} />
            <span className="mt-0.5 text-[11px] font-bold tabular-nums sm:text-xs">10</span>
          </button>
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-16 transition-opacity duration-300 sm:px-5',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <div
          role="slider"
          aria-label="Seek"
          tabIndex={0}
          className="group/scrub pointer-events-auto mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/25 transition-all hover:h-2"
          onClick={onScrub}
          onKeyDown={() => {}}
        >
          <div
            className="relative h-full rounded-full bg-[var(--ariome-gold)] transition-all group-hover/scrub:brightness-110"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--ariome-gold)] opacity-0 shadow-lg ring-2 ring-white/80 transition group-hover/scrub:opacity-100" />
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="flex size-9 items-center justify-center rounded-md text-white transition hover:bg-white/15"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-6 fill-white" /> : <Play className="size-6 fill-white" />}
          </button>

          <span className="min-w-[5.5rem] text-xs font-medium tabular-nums text-white/90 sm:text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <div
            className="relative flex items-center"
            onMouseEnter={() => setVolumeOpen(true)}
            onMouseLeave={() => setVolumeOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMuted((m) => !m)
                bumpControls()
              }}
              className="flex size-9 items-center justify-center rounded-md text-white transition hover:bg-white/15"
              aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </button>
            <div
              className={cn(
                'ml-1 flex items-center overflow-hidden transition-all duration-200',
                volumeOpen ? 'w-24 opacity-100' : 'w-0 opacity-0',
              )}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setVolume(v)
                  setMuted(v === 0)
                  bumpControls()
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-1 w-full cursor-pointer accent-[var(--ariome-gold)]"
                aria-label="Volume"
              />
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSettingsOpen((v) => !v)
                bumpControls()
              }}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-md px-2 text-xs text-white transition hover:bg-white/15',
                settingsOpen && 'bg-white/15',
              )}
              aria-label="Playback settings"
            >
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {settingsOpen && (
              <div className="absolute bottom-11 right-0 z-40 w-56 rounded-lg border border-white/15 bg-black/90 p-3 text-xs shadow-2xl">
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-white/90">
                    <Subtitles className="size-3.5" />
                    <span>{currentSubtitleLabel}</span>
                  </div>
                  <select
                    value={selectedSubtitle}
                    onChange={(e) => void applySubtitle(e.target.value)}
                    className="w-full rounded border border-white/20 bg-black/70 px-2 py-1.5 text-white outline-none focus:border-[var(--ariome-gold)]"
                  >
                    <option value="off">Off</option>
                    {menuSubtitleOptions.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.label}
                      </option>
                    ))}
                  </select>
                  {transcribeStatus === 'processing' && (
                    <p className="mt-1.5 text-[10px] leading-snug text-amber-200/90">
                      Generating speech captions… (long films may take several minutes)
                    </p>
                  )}
                  {transcribeStatus !== 'ready' &&
                    transcribeStatus !== 'processing' &&
                    transcribeStatus !== 'failed' &&
                    subtitleCues.length > 0 &&
                    selectedSubtitle !== 'off' && (
                      <p className="mt-1.5 text-[10px] leading-snug text-white/50">
                        Showing title text until speech captions are ready (not synced to
                        dialogue).
                      </p>
                    )}
                  {transcribeStatus === 'pending' && (
                    <p className="mt-1.5 text-[10px] leading-snug text-white/50">
                      Speech captions will appear after processing.
                    </p>
                  )}
                  {transcribeStatus === 'failed' && (
                    <p className="mt-1.5 text-[10px] leading-snug text-red-200/90">
                      {transcribeError ||
                        'Speech captions could not be generated. Ask your teacher to open My videos and tap Retry captions.'}
                    </p>
                  )}
                  {transcribeStatus === 'ready' && subtitleCues.length > 1 && (
                    <p className="mt-1.5 text-[10px] leading-snug text-emerald-200/80">
                      Synced to spoken audio.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1.5 text-white/90">Quality: {currentQualityLabel}</div>
                  <select
                    value={selectedQuality}
                    onChange={(e) => applyQuality(e.target.value)}
                    className="w-full rounded border border-white/20 bg-black/70 px-2 py-1.5 text-white outline-none focus:border-[var(--ariome-gold)]"
                  >
                    <option value="auto">Auto</option>
                    {qualityOptions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              void toggleFullscreen()
            }}
            className="flex size-9 items-center justify-center rounded-md text-white transition hover:bg-white/15"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
