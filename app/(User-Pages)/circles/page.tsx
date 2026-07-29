'use client'

import Demo7Layout from '@/app/components/layouts/demo7/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'
import { StreamingPageHeader, StreamingShell } from '@/app/components/streaming'
import { useCallback, useMemo, useState } from 'react'

const CIRCLE_FILTERS = [
  'All',
  'Healing',
  'Resilience',
  'Love',
  'Mindfulness',
  'Growth',
  'Joy',
  'Gratitude',
] as const

type CircleFilter = (typeof CIRCLE_FILTERS)[number]
type CircleTag = Exclude<CircleFilter, 'All'>

const INTENTIONS: CircleTag[] = [
  'Healing',
  'Resilience',
  'Love',
  'Mindfulness',
  'Growth',
  'Joy',
  'Gratitude',
]

interface Circle {
  id: string
  title: string
  author: string
  description?: string
  tag: CircleTag
  members: number
  posts: number
  avatar: string
}

const TAG_DOT: Record<CircleTag, string> = {
  Healing: 'bg-emerald-500',
  Resilience: 'bg-violet-500',
  Love: 'bg-rose-500',
  Mindfulness: 'bg-teal-500',
  Growth: 'bg-sky-500',
  Joy: 'bg-amber-500',
  Gratitude: 'bg-orange-500',
}

const SEED_CIRCLES: Circle[] = [
  {
    id: '1',
    title: 'Stillness Circle',
    author: 'Admin User',
    description: 'Quiet moments and shared breath.',
    tag: 'Mindfulness',
    members: 35,
    posts: 96,
    avatar: 'S',
  },
  {
    id: '2',
    title: 'Resilience Warriors',
    author: 'Ariome',
    description: 'Building strength together through life’s ups and downs.',
    tag: 'Resilience',
    members: 128,
    posts: 402,
    avatar: 'R',
  },
  {
    id: '3',
    title: 'Joy Seekers',
    author: 'Ariome',
    description: 'Small wins, laughter, and everyday brightness.',
    tag: 'Joy',
    members: 52,
    posts: 210,
    avatar: 'J',
  },
  {
    id: '4',
    title: 'Heart Space',
    author: 'Community',
    tag: 'Love',
    members: 89,
    posts: 156,
    avatar: '♥',
  },
  {
    id: '5',
    title: 'Grateful Living',
    author: 'Ariome',
    description: 'Daily gratitude prompts and reflections.',
    tag: 'Gratitude',
    members: 201,
    posts: 890,
    avatar: 'G',
  },
  {
    id: '6',
    title: 'Healing Path',
    author: 'Admin User',
    tag: 'Healing',
    members: 44,
    posts: 72,
    avatar: 'H',
  },
  {
    id: '7',
    title: 'Rise & Grow',
    author: 'Ariome',
    description: 'Goals, habits, and supportive accountability.',
    tag: 'Growth',
    members: 76,
    posts: 188,
    avatar: '↑',
  },
]

function CircleCard({
  circle,
  onJoin,
  onOpen,
}: {
  circle: Circle
  onJoin: (c: Circle) => void
  onOpen: (c: Circle) => void
}) {
  return (
    <article className="relative rounded-2xl border border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] p-4 shadow-[var(--ariome-shadow)] ring-1 ring-[var(--ariome-border)] transition hover:border-[var(--ariome-border-strong)] hover:bg-[var(--ariome-surface-hover)] sm:p-5">
      <button
        type="button"
        onClick={() => onOpen(circle)}
        className="absolute right-3 top-3 rounded-full p-2 text-[var(--ariome-text-faint)] transition hover:bg-[var(--ariome-bg-elevated)] hover:text-[var(--ariome-text)]"
        aria-label={`View ${circle.title}`}
      >
        <ChevronRight className="size-5" />
      </button>
      <div className="flex gap-4 pr-10">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white shadow-inner ring-2 ring-teal-200/60 dark:from-teal-600 dark:to-teal-800 dark:ring-teal-400/30"
          aria-hidden
        >
          {circle.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug text-[var(--ariome-text)]">{circle.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--ariome-text-muted)] sm:text-sm">by {circle.author}</p>
          {circle.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ariome-text-muted)]">
              {circle.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--ariome-text)]">
              <span className={cn('size-2 shrink-0 rounded-full', TAG_DOT[circle.tag])} aria-hidden />
              {circle.tag}
            </span>
            <span className="text-xs text-[var(--ariome-text-muted)]">
              {circle.members} members · {circle.posts} posts
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end border-t border-[var(--ariome-border)] pt-4">
        <Button
          type="button"
          size="sm"
          onClick={() => onJoin(circle)}
          className="rounded-full bg-[var(--ariome-gold)] px-6 font-semibold text-[#1a1510] hover:brightness-110"
        >
          Join
        </Button>
      </div>
    </article>
  )
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>(() => [...SEED_CIRCLES])
  const [filter, setFilter] = useState<CircleFilter>('All')
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createIntention, setCreateIntention] = useState<CircleTag | null>(null)

  const resetCreateForm = useCallback(() => {
    setCreateName('')
    setCreateDescription('')
    setCreateIntention(null)
  }, [])

  const openCreate = useCallback(() => {
    resetCreateForm()
    setCreateOpen(true)
  }, [resetCreateForm])

  const filtered = useMemo(() => {
    if (filter === 'All') return circles
    return circles.filter((c) => c.tag === filter)
  }, [circles, filter])

  const handleCreateCircle = useCallback(() => {
    const name = createName.trim()
    if (!name) {
      window.alert('Please enter a circle name.')
      return
    }
    if (!createIntention) {
      window.alert('Select an intention for your circle.')
      return
    }
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`
    const avatar = name.charAt(0).toUpperCase() || '?'
    const newCircle: Circle = {
      id,
      title: name,
      author: 'Admin User',
      description: createDescription.trim() || undefined,
      tag: createIntention,
      members: 1,
      posts: 0,
      avatar,
    }
    setCircles((prev) => [newCircle, ...prev])
    setCreateOpen(false)
    resetCreateForm()
  }, [createName, createDescription, createIntention, resetCreateForm])

  return (
    <Demo7Layout>
      <StreamingShell activeNav="circles" wide className="pt-2 md:pb-8">
          <div className="relative">
            <StreamingPageHeader
              brand="Ariome"
              title="Circles"
              subtitle="Find your people — join conversations that matter."
              center
              showSettings={false}
            />
            <div className="absolute right-0 top-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={openCreate}
                className="flex size-11 items-center justify-center rounded-full bg-[var(--ariome-gold)] text-[#1a1510] text-white shadow-md shadow-teal-900/10 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                aria-label="Create new circle"
              >
                <Plus className="size-6" strokeWidth={2.5} />
              </button>
              {/* <Link
                href="/profile"
                className="flex size-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Settings"
              >
                <Settings className="size-5" />
              </Link> */}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
            {CIRCLE_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm',
                  filter === f
                    ? 'border-[var(--ariome-gold)]/50 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)] shadow-sm'
                    : 'border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <section className="mt-8 sm:mt-10" aria-label="Circles list">
            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] py-12 text-center text-sm text-[var(--ariome-text-muted)]">
                No circles in this category yet.
              </p>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-4 pb-6 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((circle) => (
                  <li key={circle.id}>
                    <CircleCard
                      circle={circle}
                      onJoin={() => window.alert(`Join request sent for “${circle.title}” (demo).`)}
                      onOpen={() => window.alert(`Circle details for “${circle.title}” — link this to a real route when ready.`)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <SheetContent
          side="bottom"
          className={cn(
            'flex max-h-[min(92dvh,720px)] flex-col gap-0 overflow-hidden rounded-t-2xl border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] p-0',
            'sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2',
          )}
        >
          <SheetHeader className="space-y-0 border-b border-[var(--ariome-border)] px-5 py-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-lg font-semibold text-[var(--ariome-text)] sm:text-xl">
                Create New Circle
              </SheetTitle>
              <SheetClose asChild>
                <button
                  type="button"
                  className="rounded-full p-2 text-[var(--ariome-text-muted)] transition hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          <SheetBody className="flex flex-col gap-5 px-5 py-5">
            <div className="space-y-2">
              <label htmlFor="circle-name" className="text-sm font-medium text-[var(--ariome-text)]">
                Circle name
              </label>
              <Input
                id="circle-name"
                variant="lg"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Circle Name"
                className="border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text)] placeholder:text-[var(--ariome-text-faint)]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="circle-description" className="text-sm font-medium text-[var(--ariome-text)]">
                Description
              </label>
              <Textarea
                id="circle-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Description — What is this circle about?"
                variant="lg"
                className="min-h-[120px] resize-y border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text)] placeholder:text-[var(--ariome-text-faint)]"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--ariome-text)]">Select Intention</p>
              <div className="flex flex-wrap gap-2">
                {INTENTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCreateIntention(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
                      createIntention === tag
                        ? 'border-[var(--ariome-gold)]/50 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)] shadow-sm'
                        : 'border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text-muted)] hover:text-[var(--ariome-text)]',
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </SheetBody>

          <div className="border-t border-[var(--ariome-border)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
            <Button
              type="button"
              onClick={handleCreateCircle}
              className="h-12 w-full rounded-xl bg-[var(--ariome-gold)] text-base font-semibold text-[#1a1510] shadow-sm hover:brightness-110"
            >
              Create Circle
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      </StreamingShell>
    </Demo7Layout>
  )
}
