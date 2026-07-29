'use client'

import Demo7Layout from '@/app/components/layouts/demo7/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react'
import WellnessToolkit from '@/app/components/wellness/wellness-toolkit'
import { StreamingPageHeader, StreamingShell } from '@/app/components/streaming'
import {
  ShowcaseHero,
  ShowcaseMoodBar,
  ShowcasePoster,
  ShowcaseRow,
} from '@/app/components/showcase'
import { formatDuration } from '@/lib/videos/formatDuration'
import PrimeWatchViewer from '@/app/components/videos/prime-watch-viewer'
import { useCallback, useEffect, useMemo, useState } from 'react'

const FREE_PREVIEW_MS = 20_000

function formatPreviewClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

const PRACTICE_FILTERS = ['All', 'Breathwork', 'Stillness', 'Gratitude', 'Body'] as const
type PracticeFilter = (typeof PRACTICE_FILTERS)[number]

type PracticeKind = 'breath' | 'still' | 'gratitude' | 'body'

interface PracticeItem {
  id: string
  youtubeId: string
  title: string
  description: string
  durationSec: number
  category: Exclude<PracticeFilter, 'All'>
  kind: PracticeKind
}

const PRACTICES: PracticeItem[] = [
  {
    id: '1',
    youtubeId: 'LXb3EKWsInQ',
    title: 'Box Breathing',
    description: 'Rhythmic counts to regulate the nervous system.',
    durationSec: 300,
    category: 'Breathwork',
    kind: 'breath',
  },
  {
    id: '2',
    youtubeId: '1ZYbU82GVz4',
    title: '4-7-8 Relaxation',
    description: 'Classic breathing pattern with calming ambience.',
    durationSec: 420,
    category: 'Breathwork',
    kind: 'breath',
  },
  {
    id: '3',
    youtubeId: 'eRsGyueVLvQ',
    title: 'Mindfulness Meditation',
    description: 'A reflective arc through light, shadow, and stillness.',
    durationSec: 180,
    category: 'Stillness',
    kind: 'still',
  },
  {
    id: '4',
    youtubeId: 'wpWNmPvTKrA',
    title: 'Grateful Pause',
    description: 'Soft focus and breath cues for gratitude practice.',
    durationSec: 480,
    category: 'Gratitude',
    kind: 'gratitude',
  },
  {
    id: '5',
    youtubeId: 'Ke90Tje7K0k',
    title: 'Body Scan',
    description: 'Progressive attention from head to toe.',
    durationSec: 660,
    category: 'Body',
    kind: 'body',
  },
  {
    id: '6',
    youtubeId: 'ScMzIvxBSi4',
    title: 'Gentle Movement',
    description: 'Light stretching and energy release.',
    durationSec: 240,
    category: 'Body',
    kind: 'body',
  },
]

function youtubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export default function PracticePage() {
  const router = useRouter()
  const [filter, setFilter] = useState<PracticeFilter>('All')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<PracticeItem | null>(null)
  const [previewExpired, setPreviewExpired] = useState(false)
  const [paywallDismissed, setPaywallDismissed] = useState(false)
  const [iframeEpoch, setIframeEpoch] = useState(0)
  const [previewElapsedMs, setPreviewElapsedMs] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [fullAccess, setFullAccess] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'All') return PRACTICES
    return PRACTICES.filter((p) => p.category === filter)
  }, [filter])

  const featuredPractice = filtered[0] ?? null

  const openViewer = useCallback((item: PracticeItem) => {
    setActiveItem(item)
    setViewerOpen(true)
    setPreviewExpired(false)
    setPaywallDismissed(false)
    setIframeEpoch((e) => e + 1)
  }, [])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    setActiveItem(null)
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
        if (!cancelled) router.replace('/practice', { scroll: false })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    if (!viewerOpen || !activeItem || fullAccess) return
    setPreviewExpired(false)
    const t = window.setTimeout(() => {
      setPreviewExpired(true)
      setPaywallDismissed(false)
    }, FREE_PREVIEW_MS)
    return () => window.clearTimeout(t)
  }, [viewerOpen, activeItem, iframeEpoch, fullAccess])

  const selectInViewer = useCallback((item: PracticeItem) => {
    setActiveItem(item)
    setPreviewExpired(false)
    setPaywallDismissed(false)
    setIframeEpoch((e) => e + 1)
  }, [])

  const paywallBlocking = Boolean(!fullAccess && previewExpired && !paywallDismissed)
  const showIframe = Boolean(activeItem && !paywallBlocking)

  useEffect(() => {
    if (!showIframe || !activeItem || fullAccess) {
      setPreviewElapsedMs(0)
      return
    }
    const started = performance.now()
    setPreviewElapsedMs(0)
    const id = window.setInterval(() => {
      setPreviewElapsedMs(Math.min(FREE_PREVIEW_MS, performance.now() - started))
    }, 120)
    return () => window.clearInterval(id)
  }, [showIframe, activeItem, iframeEpoch, fullAccess])

  const onMaybeLater = useCallback(() => {
    closeViewer()
  }, [closeViewer])

  const startStripeCheckout = useCallback(async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ successPath: '/practice' }),
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
      <StreamingShell activeNav="practice" wide className="pt-2 md:pb-8">
          <StreamingPageHeader brand="Ariome" title="Practice" center />

          {featuredPractice ? (
            <ShowcaseHero
              title={featuredPractice.title}
              description={featuredPractice.description}
              thumbnailUrl={youtubeThumbnail(featuredPractice.youtubeId)}
              moodLabel={featuredPractice.category}
              durationLabel={formatDuration(featuredPractice.durationSec)}
              onPlay={() => openViewer(featuredPractice)}
            />
          ) : null}

          <ShowcaseMoodBar
            moods={PRACTICE_FILTERS}
            active={filter}
            onSelect={(f) => setFilter(f as PracticeFilter)}
            labelFor={(f) => f}
          />

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <WellnessToolkit />
          </div>

          <Link
            href="/programs"
            className="ariome-glass flex items-center justify-between gap-4 rounded-[var(--ariome-radius-lg)] p-5 transition hover:border-[var(--ariome-gold)]/40"
          >
            <div>
              <p className="ariome-label">Learn</p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Programs, courses &amp; habit journeys
              </h2>
              <p className="mt-1 text-sm text-white/55">
                Multi-day programs, creator courses, certificates, and daily habits.
              </p>
            </div>
            <span className="ariome-btn-primary shrink-0 rounded-full px-5 py-2 text-sm">
              Open →
            </span>
          </Link>

          <ShowcaseRow
            title="Practices & rituals"
            subtitle="Guided sessions — scroll and tap to play"
            icon={<Sparkles className="size-5" />}
            isEmpty={filtered.length === 0}
            emptyMessage="No practices match this filter."
          >
            {filtered.map((item) => (
              <ShowcasePoster
                key={item.id}
                title={item.title}
                thumbnailUrl={youtubeThumbnail(item.youtubeId)}
                durationLabel={formatDuration(item.durationSec)}
                moodLabel={item.category}
                meta={item.description}
                badges={fullAccess ? ['full'] : ['preview']}
                badgeLabels={{ full: 'Full access', preview: '20s preview' }}
                isActive={viewerOpen && activeItem?.id === item.id}
                onClick={() => openViewer(item)}
              />
            ))}
          </ShowcaseRow>

      <PrimeWatchViewer
        open={viewerOpen}
        onClose={closeViewer}
        title={activeItem?.title ?? ''}
        meta={activeItem?.category}
        paywallOverlay={
          activeItem && !fullAccess && previewExpired && !paywallDismissed ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#1a222d] px-8 py-10 text-center">
                <Lock className="mx-auto size-12 text-[var(--ariome-gold)]" strokeWidth={1.5} />
                <h3 className="mt-4 text-2xl font-bold text-white">Preview ended</h3>
                <p className="mt-2 text-sm text-white/55">Subscribe to keep watching</p>
                <Button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={startStripeCheckout}
                  className="mt-6 w-full rounded-md bg-[var(--ariome-gold)] py-6 font-semibold text-[#1a1510] hover:brightness-110"
                >
                  {checkoutLoading ? (
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  ) : (
                    'Subscribe now'
                  )}
                </Button>
                <button type="button" onClick={onMaybeLater} className="mt-4 text-sm text-white/50">
                  Not now
                </button>
              </div>
            </div>
          ) : undefined
        }
        bottomRail={
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectInViewer(p)}
                className={cn(
                  'relative h-[4.25rem] w-[7.5rem] shrink-0 overflow-hidden rounded-md sm:h-[5.25rem] sm:w-[9.25rem]',
                  activeItem?.id === p.id ? 'ring-2 ring-[var(--ariome-gold)]' : 'opacity-70 hover:opacity-100',
                )}
              >
                <img src={youtubeThumbnail(p.youtubeId)} alt="" className="h-full w-full object-cover" />
                {activeItem?.id === p.id && (
                  <span className="absolute inset-x-0 bottom-0 bg-[var(--ariome-gold)] py-0.5 text-[9px] font-bold uppercase text-[#1a1510]">
                    Now playing
                  </span>
                )}
              </button>
            ))}
          </div>
        }
      >
        {activeItem && showIframe ? (
          <div className="relative h-full w-full">
            <iframe
              key={`${activeItem.youtubeId}-${iframeEpoch}-${fullAccess ? 'full' : 'prev'}`}
              src={`https://www.youtube-nocookie.com/embed/${activeItem.youtubeId}?autoplay=1&rel=0&controls=1&modestbranding=1&playsinline=1`}
              title={activeItem.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
            {!fullAccess && (
              <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 px-4" aria-hidden>
                <div className="flex justify-between text-xs tabular-nums text-white">
                  <span className="rounded bg-[var(--ariome-gold)]/90 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1a1510]">
                    Preview
                  </span>
                  <span>
                    {formatPreviewClock(previewElapsedMs / 1000)} /{' '}
                    {formatPreviewClock(FREE_PREVIEW_MS / 1000)}
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-[var(--ariome-gold)]"
                    style={{ width: `${Math.min(100, (previewElapsedMs / FREE_PREVIEW_MS) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : activeItem ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={youtubeThumbnail(activeItem.youtubeId)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <p className="relative z-10 text-white/70">Preview ended — pick another below</p>
          </div>
        ) : null}
      </PrimeWatchViewer>
      </StreamingShell>
    </Demo7Layout>
  )
}
