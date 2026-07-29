'use client'

import Demo7Layout from '@/app/components/layouts/demo7/layout'
import DreamJournalPanel from '@/app/components/journal/dream-journal-panel'
import EnhancedReflectionCard from '@/app/components/journal/enhanced-reflection-card'
import JournalPrompts from '@/app/components/journal/journal-prompts'
import type { ReflectionEntry } from '@/lib/content/types'
import { getReflections, saveReflection as persistReflection } from '@/lib/journal/reflections'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Check,
  Mic,
  Moon,
  Plus,
  X,
} from 'lucide-react'
import { StreamingPageHeader, StreamingShell } from '@/app/components/streaming'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const MOODS = [
  'Peaceful',
  'Grateful',
  'Hopeful',
  'Reflective',
  'Joyful',
  'Anxious',
  'Sad',
  'Energized',
  'Curious',
  'Content',
] as const

type Mood = (typeof MOODS)[number]

function MoodPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: Mood | null
  onChange: (m: Mood) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--ariome-text)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
              value === m
                ? 'border-[var(--ariome-gold)]/50 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)] shadow-sm'
                : 'border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text-muted)] hover:border-[var(--ariome-border-strong)] hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]',
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

type JournalTab = 'reflections' | 'dreams'

export default function JournalPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<JournalTab>('reflections')
  const [reflections, setReflections] = useState<ReflectionEntry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dreamDialogOpen, setDreamDialogOpen] = useState(false)

  useEffect(() => {
    setReflections(getReflections())
  }, [])

  useEffect(() => {
    if (searchParams.get('tab') === 'dreams') {
      setTab('dreams')
      if (searchParams.get('new') === '1') setDreamDialogOpen(true)
    }
  }, [searchParams])

  const refreshReflections = useCallback(() => {
    setReflections(getReflections())
  }, [])
  const [moodBefore, setMoodBefore] = useState<Mood | null>(null)
  const [moodAfter, setMoodAfter] = useState<Mood | null>(null)
  const [body, setBody] = useState('')

  const sorted = useMemo(
    () => [...reflections].sort((a, b) => b.createdAt - a.createdAt),
    [reflections],
  )

  const resetForm = useCallback(() => {
    setMoodBefore(null)
    setMoodAfter(null)
    setBody('')
  }, [])

  const openNew = useCallback(() => {
    if (tab === 'dreams') {
      setDreamDialogOpen(true)
      return
    }
    resetForm()
    setDialogOpen(true)
  }, [resetForm, tab])

  const saveReflection = useCallback(() => {
    const text = body.trim()
    if (!moodBefore || !moodAfter) {
      window.alert('Choose how you feel before and after reflecting.')
      return
    }
    if (!text) {
      window.alert('Write something in your reflection.')
      return
    }
    persistReflection({
      moodBefore,
      moodAfter,
      body: text,
    })
    refreshReflections()
    setDialogOpen(false)
    resetForm()
  }, [body, moodBefore, moodAfter, resetForm, refreshReflections])

  const applyPrompt = useCallback((prompt: string) => {
    setBody((prev) => (prev.trim() ? `${prev.trim()}\n\n${prompt}` : prompt))
    setDialogOpen(true)
  }, [])

  return (
    <Demo7Layout>
      <StreamingShell activeNav="journal" wide className="pt-2 md:pb-8">
          <div className="relative">
            <StreamingPageHeader
              brand="Ariome"
              title="Your Journal"
              subtitle={tab === 'dreams' ? 'Capture dreams and sleep quality.' : 'Private space for your reflections.'}
              center
              showSettings={false}
            />
            <div className="absolute right-0 top-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={openNew}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
                  tab === 'dreams'
                    ? 'bg-indigo-600 shadow-indigo-900/15 hover:bg-indigo-500 focus-visible:ring-indigo-400'
                    : 'bg-emerald-600 shadow-emerald-900/15 hover:bg-emerald-500 focus-visible:ring-emerald-400',
                )}
                aria-label={tab === 'dreams' ? 'Log a dream' : 'New reflection'}
              >
                <Plus className="size-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-md justify-center gap-2 rounded-full border border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab('reflections')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === 'reflections'
                  ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
                  : 'text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]',
              )}
            >
              <BookOpen className="size-4" aria-hidden />
              Reflections
            </button>
            <button
              type="button"
              onClick={() => setTab('dreams')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === 'dreams'
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                  : 'text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]',
              )}
            >
              <Moon className="size-4" aria-hidden />
              Dreams
            </button>
          </div>

          {tab === 'dreams' ? (
            <div className="mt-10 sm:mt-12">
              <DreamJournalPanel dialogOpen={dreamDialogOpen} onDialogOpenChange={setDreamDialogOpen} />
            </div>
          ) : (
          <>
          <div className="mx-auto mt-8 max-w-2xl">
            <JournalPrompts onSelectPrompt={applyPrompt} />
          </div>
          <section className="mt-10 sm:mt-12" aria-label="Reflection entries">
            {sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] py-16 text-center">
                <p className="text-sm font-semibold text-[var(--ariome-text)] sm:text-base">No reflections yet.</p>
                <p className="mt-2 text-sm text-[var(--ariome-text-muted)]">Tap the green + button to write your first entry.</p>
                <Button type="button" onClick={openNew} className="mt-6 rounded-full bg-[var(--ariome-gold)] px-6 font-semibold text-[#1a1510] hover:brightness-110">
                  New reflection
                </Button>
              </div>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-4 pb-6 lg:grid-cols-2 xl:grid-cols-3">
                {sorted.map((entry) => (
                  <li key={entry.id}>
                    <EnhancedReflectionCard entry={entry} onInsightSaved={refreshReflections} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          </>
          )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] p-0 shadow-xl',
            'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--ariome-border)] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-[var(--ariome-text)] sm:text-xl">New Reflection</h2>
            <DialogClose
              className="rounded-full p-2 text-[var(--ariome-text-muted)] transition hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]"
              aria-label="Close"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <MoodPicker
              label="How are you feeling before reflecting?"
              value={moodBefore}
              onChange={setMoodBefore}
            />

            <div className="space-y-2">
              <label htmlFor="reflection-body" className="sr-only">
                Reflection
              </label>
              <div className="relative">
                <Textarea
                  id="reflection-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Let your thoughts flow..."
                  variant="lg"
                  className="min-h-[180px] resize-y border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] pr-12 text-[var(--ariome-text)] placeholder:text-[var(--ariome-text-faint)] focus-visible:bg-[var(--ariome-surface)]"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 rounded-full p-2 text-teal-600 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/50"
                  aria-label="Voice input (coming soon)"
                  title="Voice input coming soon"
                >
                  <Mic className="size-5" />
                </button>
              </div>
            </div>

            <MoodPicker
              label="How do you feel after reflecting?"
              value={moodAfter}
              onChange={setMoodAfter}
            />
          </div>

          <div className="border-t border-[var(--ariome-border)] p-4 sm:p-5">
            <Button
              type="button"
              onClick={saveReflection}
              className="h-12 w-full rounded-xl bg-[var(--ariome-gold)] text-base font-semibold text-[#1a1510] shadow-sm hover:brightness-110"
            >
              <Check className="mr-2 size-5" strokeWidth={2.5} aria-hidden />
              Save Reflection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </StreamingShell>
    </Demo7Layout>
  )
}
