'use client'

import Demo7Layout from '@/app/components/layouts/demo7/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Crown,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StreamingShell } from '@/app/components/streaming'
import { authenticatedFetch } from '@/lib/auth/authenticatedFetch'
import CinematicVideoPlayer from '@/app/components/videos/cinematic-video-player'
import PrimeWatchViewer from '@/app/components/videos/prime-watch-viewer'
import VideoEngagementPanel from '@/app/components/videos/video-engagement-panel'
import { TEACHER_VIDEOS_POLL_MS } from '@/lib/videos/constants'
import { recordVideoView, uploadClipVideoId } from '@/lib/videos/recordView'
import { flushActiveWatchTime } from '@/lib/videos/watchTime'
import type { TeacherVideo } from '@/lib/videos/types'
import {
  ExploreShowcasePoster,
  ShowcaseHero,
  ShowcaseMoodBar,
  ShowcaseRow,
} from '@/app/components/showcase'
import { localizeCuratedClip } from '@/lib/i18n/localizedClips'
import { useTranslations } from '@/lib/i18n/locale-context'
import { formatDuration } from '@/lib/videos/formatDuration'
import { resolveSubtitleTracks } from '@/lib/videos/subtitleTracks'

/** Free preview length for every video in the fullscreen viewer */
const FREE_PREVIEW_MS = 20_000

function formatPreviewClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

const MOOD_FILTERS = [
  'All',
  'Peaceful',
  'Grateful',
  'Hopeful',
  'Joyful',
  'Reflective',
  'Anxious',
] as const

type MoodFilter = (typeof MOOD_FILTERS)[number]

type ClipSection = 'wisdom' | 'practices'

interface ExploreClip {
  id: string
  source: 'youtube' | 'upload'
  videoDbId?: string
  youtubeId?: string
  videoUrl?: string
  playbackUrl?: string
  subtitleTracks?: TeacherVideo['subtitleTracks']
  transcodeStatus?: TeacherVideo['transcodeStatus']
  transcribeStatus?: TeacherVideo['transcribeStatus']
  transcribeError?: string
  mimeType?: string
  title: string
  description: string
  mood: Exclude<MoodFilter, 'All'>
  likes: number
  durationSeconds: number
  premium: boolean
  previewSec: number
  section: ClipSection
  author?: string
  thumbnailUrl?: string | null
  aiTranslated?: boolean
}

const CLIP_MOODS = ['Peaceful', 'Grateful', 'Hopeful', 'Joyful', 'Reflective', 'Anxious'] as const

function teacherVideoToClip(v: TeacherVideo): ExploreClip {
  const mood = (CLIP_MOODS as readonly string[]).includes(v.mood)
    ? (v.mood as (typeof CLIP_MOODS)[number])
    : 'Peaceful'
  return {
    id: `upload-${v.id}`,
    source: 'upload',
    videoDbId: v.id,
    videoUrl: v.videoUrl,
    playbackUrl: v.playbackUrl || v.hlsUrl || v.videoUrl,
    subtitleTracks: resolveSubtitleTracks(v.id, v.subtitleTracks),
    transcodeStatus: v.transcodeStatus,
    transcribeStatus: v.transcribeStatus,
    transcribeError: v.transcribeError,
    thumbnailUrl: v.thumbnailUrl,
    mimeType: v.mimeType,
    title: v.title,
    description: v.description || 'Uploaded by your teacher',
    mood,
    likes: v.likeCount ?? 0,
    durationSeconds: v.durationSeconds ?? 0,
    premium: false,
    previewSec: 20,
    section: v.section,
    author: v.teacherName || 'Teacher',
    aiTranslated: v.localized,
  }
}

/** Curated embed-friendly IDs — swap for your own channel videos anytime. */
const CLIPS: ExploreClip[] = [
  {
    id: '1',
    source: 'youtube',
    youtubeId: 'aqz-KE-bpKQ',
    title: 'Safe Haven',
    description: 'Grounding visuals and gentle pacing for anxious moments.',
    mood: 'Anxious',
    likes: 523,
    durationSeconds: 600,
    premium: true,
    previewSec: 20,
    section: 'wisdom',
  },
  {
    id: '2',
    source: 'youtube',
    youtubeId: 'eRsGyueVLvQ',
    title: 'Journey Inward',
    description: 'A reflective arc through light, shadow, and stillness.',
    mood: 'Reflective',
    likes: 445,
    durationSeconds: 720,
    premium: false,
    previewSec: 25,
    section: 'wisdom',
  },
  {
    id: '3',
    source: 'youtube',
    youtubeId: 'M7lc1UVf-VE',
    title: 'Morning Clarity',
    description: 'Short reset to start the day with intention.',
    mood: 'Hopeful',
    likes: 892,
    durationSeconds: 300,
    premium: false,
    previewSec: 15,
    section: 'wisdom',
  },
  {
    id: '4',
    source: 'youtube',
    youtubeId: 'wpWNmPvTKrA',
    title: 'Grateful Pause',
    description: 'Soft focus and breath cues for gratitude practice.',
    mood: 'Grateful',
    likes: 612,
    durationSeconds: 480,
    premium: true,
    previewSec: 20,
    section: 'wisdom',
  },
  {
    id: '5',
    source: 'youtube',
    youtubeId: 'LXb3EKWsInQ',
    title: 'Box Breathing',
    description: 'Rhythmic counts to regulate the nervous system.',
    mood: 'Anxious',
    likes: 1204,
    durationSeconds: 300,
    premium: true,
    previewSec: 20,
    section: 'practices',
  },
  {
    id: '6',
    source: 'youtube',
    youtubeId: '1ZYbU82GVz4',
    title: '4-7-8 Relaxation',
    description: 'Classic breathing pattern with calming ambience.',
    mood: 'Peaceful',
    likes: 2103,
    durationSeconds: 420,
    premium: false,
    previewSec: 15,
    section: 'practices',
  },
  {
    id: '7',
    source: 'youtube',
    youtubeId: 'ScMzIvxBSi4',
    title: 'Joyful Movement',
    description: 'Light stretching and energy release.',
    mood: 'Joyful',
    likes: 334,
    durationSeconds: 360,
    premium: false,
    previewSec: 18,
    section: 'practices',
  },
  {
    id: '8',
    source: 'youtube',
    youtubeId: 'Ke90Tje7K0k',
    title: 'Body Scan',
    description: 'Progressive attention from head to toe.',
    mood: 'Peaceful',
    likes: 781,
    durationSeconds: 660,
    premium: true,
    previewSec: 22,
    section: 'practices',
  },
]

function youtubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function clipThumbnail(clip: ExploreClip) {
  if (clip.source === 'upload' && clip.thumbnailUrl) return clip.thumbnailUrl
  if (clip.youtubeId) return youtubeThumbnail(clip.youtubeId)
  return ''
}

function isUploadedClip(clip: ExploreClip) {
  return clip.source === 'upload'
}

const MOOD_LABEL_KEYS: Record<MoodFilter, string> = {
  All: 'explore.moodAll',
  Peaceful: 'explore.moodPeaceful',
  Grateful: 'explore.moodGrateful',
  Hopeful: 'explore.moodHopeful',
  Joyful: 'explore.moodJoyful',
  Reflective: 'explore.moodReflective',
  Anxious: 'explore.moodAnxious',
}

export default function ExplorePage() {
  const router = useRouter()
  const { t, locale, localeLabel } = useTranslations()
  const [mood, setMood] = useState<MoodFilter>('All')
  const [teacherClips, setTeacherClips] = useState<ExploreClip[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerClip, setViewerClip] = useState<ExploreClip | null>(null)
  const [previewExpired, setPreviewExpired] = useState(false)
  const [paywallDismissed, setPaywallDismissed] = useState(false)
  const [iframeEpoch, setIframeEpoch] = useState(0)
  const [previewElapsedMs, setPreviewElapsedMs] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [fullAccess, setFullAccess] = useState(false)

  const localizedCurated = useMemo(
    () => CLIPS.map((c) => localizeCuratedClip(c, locale)),
    [locale],
  )

  const allClips = useMemo(
    () => [...teacherClips, ...localizedCurated],
    [teacherClips, localizedCurated],
  )

  const filtered = useMemo(() => {
    if (mood === 'All') return allClips
    return allClips.filter((c) => c.mood === mood)
  }, [mood, allClips])

  const teacherUploads = filtered.filter((c) => c.source === 'upload')
  const wisdom = filtered.filter((c) => c.section === 'wisdom' && c.source !== 'upload')
  const practices = filtered.filter((c) => c.section === 'practices' && c.source !== 'upload')

  const featuredClip = useMemo(
    () => teacherUploads[0] ?? wisdom[0] ?? practices[0] ?? filtered[0] ?? null,
    [teacherUploads, wisdom, practices, filtered],
  )

  const loadTeacherVideos = useCallback(async () => {
    try {
      const res = await authenticatedFetch(
        `/api/videos?locale=${encodeURIComponent(locale)}&autoTranslate=true`,
        { cache: 'no-store' },
      )
      if (!res.ok) return
      const data = (await res.json()) as { videos?: TeacherVideo[] }
      setTeacherClips((data.videos || []).map(teacherVideoToClip))
    } catch {
      /* ignore */
    }
  }, [locale])

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadTeacherVideos()
      }
    }

    refreshIfVisible()
    const interval = window.setInterval(refreshIfVisible, TEACHER_VIDEOS_POLL_MS)
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [loadTeacherVideos])

  const openViewer = useCallback((clip: ExploreClip) => {
    setViewerClip(clip)
    setViewerOpen(true)
    setPreviewExpired(false)
    setPaywallDismissed(false)
    setIframeEpoch((e) => e + 1)
    if (isUploadedClip(clip)) {
      const videoId = uploadClipVideoId(clip.id)
      if (videoId) void recordVideoView(videoId)
    }
  }, [])

  const closeViewer = useCallback(() => {
    flushActiveWatchTime()
    setViewerOpen(false)
    setViewerClip(null)
    setPreviewExpired(false)
    setPaywallDismissed(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/stripe/premium-access')
        const data = (await res.json()) as { fullAccess?: boolean }
        if (!cancelled && data.fullAccess) setFullAccess(true)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') !== 'success') return
    const sessionId = params.get('session_id')
    if (!sessionId) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/stripe/verify-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        if (!cancelled && res.ok) setFullAccess(true)
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) router.replace('/explore', { scroll: false })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  const viewerFullPlayback =
    Boolean(viewerClip && isUploadedClip(viewerClip)) || fullAccess

  /** While the paywall card is open, unmount the player so playback/audio stops. */
  const paywallBlocking = Boolean(
    viewerClip && !viewerFullPlayback && previewExpired && !paywallDismissed,
  )
  const showPlayer = Boolean(viewerClip && !paywallBlocking)

  useEffect(() => {
    if (!viewerOpen || !viewerClip || viewerFullPlayback) return
    setPreviewExpired(false)
    const t = window.setTimeout(() => {
      setPreviewExpired(true)
      setPaywallDismissed(false)
    }, FREE_PREVIEW_MS)
    return () => window.clearTimeout(t)
  }, [viewerOpen, viewerClip, iframeEpoch, viewerFullPlayback])

  const selectClipInViewer = useCallback((clip: ExploreClip) => {
    flushActiveWatchTime()
    setViewerClip(clip)
    setPreviewExpired(false)
    setPaywallDismissed(false)
    setIframeEpoch((e) => e + 1)
    if (isUploadedClip(clip)) {
      const videoId = uploadClipVideoId(clip.id)
      if (videoId) void recordVideoView(videoId)
    }
  }, [])

  useEffect(() => {
    if (!showPlayer || !viewerClip || viewerFullPlayback) {
      setPreviewElapsedMs(0)
      return
    }
    const started = performance.now()
    setPreviewElapsedMs(0)
    const id = window.setInterval(() => {
      setPreviewElapsedMs(Math.min(FREE_PREVIEW_MS, performance.now() - started))
    }, 120)
    return () => window.clearInterval(id)
  }, [showPlayer, viewerClip, iframeEpoch, viewerFullPlayback])

  const onMaybeLater = useCallback(() => {
    closeViewer()
  }, [closeViewer])

  const startStripeCheckout = useCallback(async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ successPath: '/explore' }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (data.url) window.location.assign(data.url)
      else throw new Error('No checkout URL')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not start checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }, [])

  return (
    <Demo7Layout>
      <StreamingShell activeNav="explore" wide className="pt-2 md:pb-8">
          <div className="space-y-8 sm:space-y-10">
          {locale !== 'en' && (
            <p className="ariome-glass rounded-full px-4 py-2 text-center text-xs font-medium text-[var(--ariome-gold-soft)]">
              {t('explore.localizedFeed', { locale: localeLabel })} · {t('explore.aiTranslated')}
            </p>
          )}

          {featuredClip ? (
            <ShowcaseHero
              title={featuredClip.title}
              description={featuredClip.description}
              thumbnailUrl={clipThumbnail(featuredClip)}
              moodLabel={featuredClip.mood}
              meta={t('explore.byAuthor', { author: featuredClip.author || 'Ariome' })}
              durationLabel={formatDuration(featuredClip.durationSeconds) || undefined}
              playLabel={t('explore.fullScreen')}
              moreInfoLabel={t('explore.title')}
              previewVideoUrl={
                featuredClip.source === 'upload' ? featuredClip.videoUrl : undefined
              }
              previewYoutubeId={
                featuredClip.source === 'youtube' ? featuredClip.youtubeId : undefined
              }
              onPlay={() => openViewer(featuredClip)}
              onMoreInfo={() => openViewer(featuredClip)}
            />
          ) : null}

          <ShowcaseMoodBar
            moods={MOOD_FILTERS}
            active={mood}
            onSelect={(m) => setMood(m as MoodFilter)}
            labelFor={(m) => t(MOOD_LABEL_KEYS[m as MoodFilter])}
          />

          {teacherUploads.length > 0 && (
            <ShowcaseRow
              title={t('explore.fromTeachers')}
              subtitle={t('explore.brand')}
              icon={<BookOpen className="size-5" />}
            >
              {teacherUploads.map((clip) => (
                <ExploreShowcasePoster
                  key={clip.id}
                  clip={clip}
                  thumbnailUrl={clipThumbnail(clip)}
                  onOpen={openViewer}
                  isActiveInViewer={viewerOpen && viewerClip?.id === clip.id}
                  hasFullAccess
                />
              ))}
            </ShowcaseRow>
          )}

          <ShowcaseRow
            title={t('explore.wisdomInsights')}
            icon={<BookOpen className="size-5" />}
            isEmpty={wisdom.length === 0}
            emptyMessage={t('explore.noMoodMatch')}
          >
            {wisdom.map((clip) => (
              <ExploreShowcasePoster
                key={clip.id}
                clip={clip}
                thumbnailUrl={clipThumbnail(clip)}
                onOpen={openViewer}
                isActiveInViewer={viewerOpen && viewerClip?.id === clip.id}
                hasFullAccess={fullAccess}
              />
            ))}
          </ShowcaseRow>

          <ShowcaseRow
            title={t('explore.guidedPractices')}
            icon={<Sparkles className="size-5" />}
            isEmpty={practices.length === 0}
            emptyMessage={t('explore.noMoodMatch')}
          >
            {practices.map((clip) => (
              <ExploreShowcasePoster
                key={clip.id}
                clip={clip}
                thumbnailUrl={clipThumbnail(clip)}
                onOpen={openViewer}
                isActiveInViewer={viewerOpen && viewerClip?.id === clip.id}
                hasFullAccess={fullAccess}
              />
            ))}
          </ShowcaseRow>
          </div>

      <PrimeWatchViewer
        open={viewerOpen}
        onClose={closeViewer}
        title={viewerClip?.title ?? ''}
        meta={
          viewerClip
            ? `${viewerClip.mood}${viewerClip.author ? ` · ${viewerClip.author}` : ''}`
            : undefined
        }
        detailsPanel={
          viewerClip && isUploadedClip(viewerClip) && viewerClip.videoDbId ? (
            <VideoEngagementPanel videoId={viewerClip.videoDbId} />
          ) : undefined
        }
        paywallOverlay={
          viewerClip && !viewerFullPlayback && previewExpired && !paywallDismissed ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#1a222d] px-8 py-10 text-center shadow-2xl">
                <Lock className="mx-auto size-12 text-[var(--ariome-gold)]" strokeWidth={1.5} />
                <h3 className="ariome-display mt-4 text-2xl font-semibold">Unlock full access</h3>
                <p className="mt-2 text-sm text-white/55">
                  Subscribe to continue watching and unlock all premium content
                </p>
                <Button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={startStripeCheckout}
                  className="ariome-btn-primary mt-6 w-full rounded-full py-6 text-base disabled:opacity-70"
                >
                  {checkoutLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                      Opening checkout…
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Crown className="size-5" aria-hidden />
                      Subscribe now
                    </span>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={onMaybeLater}
                  className="mt-4 w-full text-sm text-white/50 hover:text-white"
                >
                  Not now
                </button>
              </div>
            </div>
          ) : undefined
        }
        bottomRail={
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectClipInViewer(c)}
                className={cn(
                  'relative h-[4.25rem] w-[7.5rem] shrink-0 overflow-hidden rounded-md transition sm:h-[5.25rem] sm:w-[9.25rem]',
                  viewerClip?.id === c.id
                    ? 'ring-2 ring-[var(--ariome-gold)] opacity-100'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                {clipThumbnail(c) ? (
                  <img src={clipThumbnail(c)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#1e3a5f] to-[#0f1419]" />
                )}
                {viewerClip?.id === c.id && (
                  <span className="absolute inset-x-0 bottom-0 bg-[var(--ariome-gold)] py-0.5 text-[9px] font-bold uppercase text-[#1a1510]">
                    Now playing
                  </span>
                )}
              </button>
            ))}
          </div>
        }
      >
        {viewerClip && showPlayer ? (
          isUploadedClip(viewerClip) && viewerClip.videoDbId && viewerClip.videoUrl ? (
            <CinematicVideoPlayer
              videoId={viewerClip.videoDbId}
              src={viewerClip.playbackUrl || viewerClip.videoUrl}
              mimeType={viewerClip.mimeType}
              subtitleTracks={viewerClip.subtitleTracks}
              transcribeStatus={viewerClip.transcribeStatus}
              transcribeError={viewerClip.transcribeError}
              playerKey={`${viewerClip.id}-${iframeEpoch}-${viewerClip.playbackUrl || viewerClip.videoUrl}`}
              enterFullscreenOnMount
              className="h-full w-full"
            />
          ) : (
            <div className="relative h-full w-full">
              <iframe
                key={`${viewerClip.youtubeId}-${iframeEpoch}-${viewerFullPlayback ? 'full' : 'prev'}`}
                src={`https://www.youtube-nocookie.com/embed/${viewerClip.youtubeId}?${viewerFullPlayback ? 'autoplay=1&rel=0&controls=1&modestbranding=1&playsinline=1' : 'autoplay=1&rel=0&controls=1&modestbranding=1&playsinline=1'}`}
                title={viewerClip.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
              {!viewerFullPlayback && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-20 z-10 px-4 sm:bottom-24"
                  aria-hidden
                >
                  <div className="flex items-center justify-between text-xs font-medium tabular-nums text-white">
                    <span className="rounded bg-[var(--ariome-gold)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1a1510]">
                      Preview
                    </span>
                    <span>
                      {formatPreviewClock(previewElapsedMs / 1000)} /{' '}
                      {formatPreviewClock(FREE_PREVIEW_MS / 1000)}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-[var(--ariome-gold)]"
                      style={{
                        width: `${Math.min(100, (previewElapsedMs / FREE_PREVIEW_MS) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        ) : viewerClip ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            {viewerClip.youtubeId ? (
              <img
                src={youtubeThumbnail(viewerClip.youtubeId)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            ) : viewerClip.videoUrl ? (
              <video src={viewerClip.videoUrl} muted className="absolute inset-0 h-full w-full object-cover opacity-30" />
            ) : null}
            <p className="relative z-10 px-6 text-center text-white/70">
              Preview ended — subscribe or pick another title below
            </p>
          </div>
        ) : null}
      </PrimeWatchViewer>
      </StreamingShell>
    </Demo7Layout>
  )
}
