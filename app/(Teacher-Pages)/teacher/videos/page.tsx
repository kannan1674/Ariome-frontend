'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  deleteVideo,
  fetchMyVideos,
  formatVideoDate,
  formatVideoSize,
  updateVideo,
  retryVideoTranscription,
  type VideoFormPayload,
} from '@/lib/videos/teacherApi'
import { MAX_THUMBNAIL_BYTES, MAX_THUMBNAIL_LABEL } from '@/lib/videos/constants'
import type { TeacherVideo } from '@/lib/videos/types'
import { formatWatchTime } from '@/lib/videos/watchTime'
import { Clock, Film, ImageIcon, Loader2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const MOODS = ['Peaceful', 'Grateful', 'Hopeful', 'Joyful', 'Reflective', 'Anxious'] as const

const emptyForm: VideoFormPayload = {
  title: '',
  description: '',
  mood: 'Peaceful',
  section: 'wisdom',
}

export default function TeacherVideosPage() {
  const [videos, setVideos] = useState<TeacherVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<TeacherVideo | null>(null)
  const [form, setForm] = useState<VideoFormPayload>(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchMyVideos()
      setVideos(list)
    } catch {
      setError('Could not load your videos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!newThumbnail) {
      setThumbnailPreview(editing?.thumbnailUrl || null)
      return
    }
    const url = URL.createObjectURL(newThumbnail)
    setThumbnailPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [newThumbnail, editing?.thumbnailUrl])

  const onRetryCaptions = async (video: TeacherVideo) => {
    setRetryingId(video.id)
    setMessage(null)
    setError(null)
    const result = await retryVideoTranscription(video.id)
    setRetryingId(null)
    if (!result.ok) {
      setError(result.error || 'Could not start speech captions')
      return
    }
    setMessage(result.message || 'Speech caption generation started')
    void load()
  }

  const openEdit = (video: TeacherVideo) => {
    setEditError(null)
    setNewThumbnail(null)
    setThumbnailPreview(video.thumbnailUrl || null)
    setEditing(video)
    setForm({
      title: video.title,
      description: video.description || '',
      mood: (MOODS as readonly string[]).includes(video.mood)
        ? (video.mood as VideoFormPayload['mood'])
        : 'Peaceful',
      section: video.section,
    })
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setEditError(null)
    setNewThumbnail(null)
    setThumbnailPreview(null)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!form.title.trim()) {
      setEditError('Title is required.')
      return
    }
    if (newThumbnail && newThumbnail.size > MAX_THUMBNAIL_BYTES) {
      setEditError(`Thumbnail must be ${MAX_THUMBNAIL_LABEL} or smaller.`)
      return
    }

    setSaving(true)
    setEditError(null)
    const result = await updateVideo(
      editing.id,
      {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      },
      newThumbnail,
    )
    setSaving(false)

    if (!result.ok) {
      setEditError(result.error || 'Update failed')
      return
    }

    setMessage(result.message || 'Video updated.')
    closeEdit()
    await load()
  }

  const onDelete = async (video: TeacherVideo) => {
    const ok = window.confirm(`Delete "${video.title}"? This cannot be undone.`)
    if (!ok) return

    setDeletingId(video.id)
    setError(null)
    const result = await deleteVideo(video.id)
    setDeletingId(null)

    if (!result.ok) {
      setError(result.error || 'Delete failed')
      return
    }

    setMessage(result.message || 'Video deleted.')
    await load()
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gray-900">Your videos</h1>
          <p className="mt-1 text-sm text-gray-600">Edit or remove videos you have published.</p>
        </div>
        <Link
          href="/teacher"
          className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Upload new
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-teal-600" aria-label="Loading" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <Film className="mx-auto size-10 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-900">No uploads yet</p>
          <p className="mt-1 text-sm text-gray-500">Publish your first video from the Upload page.</p>
          <Link
            href="/teacher"
            className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Go to Upload →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {videos.map((video) => (
            <li
              key={video.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:size-28">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-800 to-indigo-900">
                      <Film className="size-7 text-white/80" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-gray-900">{video.title}</h2>
                  {video.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{video.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                      <Clock className="size-3" />
                      {formatWatchTime(video.watchTimeSeconds ?? 0)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{video.mood}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{video.section}</span>
                    <span>{formatVideoSize(video.size)}</span>
                    <span>{formatVideoDate(video.createdAt)}</span>
                    {video.transcribeStatus === 'ready' && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">
                        Speech captions
                      </span>
                    )}
                    {video.transcribeStatus === 'processing' && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                        Captions processing…
                      </span>
                    )}
                    {video.transcribeStatus === 'failed' && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-800">
                        Captions failed
                      </span>
                    )}
                  </div>
                  {video.transcribeStatus === 'failed' && video.transcribeError ? (
                    <p className="mt-2 text-xs text-red-600">{video.transcribeError}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(video)}
                >
                  <Pencil className="mr-1.5 size-3.5" />
                  Edit
                </Button>
                {(video.transcribeStatus === 'failed' ||
                  video.transcribeStatus === 'pending') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={retryingId === video.id}
                    onClick={() => void onRetryCaptions(video)}
                  >
                    {retryingId === video.id ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : null}
                    Retry captions
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={deletingId === video.id}
                  onClick={() => void onDelete(video)}
                >
                  {deletingId === video.id ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 size-3.5" />
                  )}
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editOpen} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="flex max-h-[min(90vh,700px)] max-w-md flex-col overflow-hidden bg-white p-0 shadow-xl">
          <DialogHeader className="mb-0 shrink-0 border-b border-gray-100 px-6 pb-4 pt-6 pr-12">
            <DialogTitle>Edit video</DialogTitle>
          </DialogHeader>
          <DialogBody className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Thumbnail
                </label>
                <label
                  htmlFor="edit-thumbnail-file"
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-3 py-4 transition hover:border-teal-400',
                    newThumbnail && 'border-teal-500',
                  )}
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="aspect-video w-full max-h-40 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon className="size-7 text-teal-600" />
                      <span className="text-xs text-gray-600">
                        Tap to add or change (JPG, PNG, WebP) · max {MAX_THUMBNAIL_LABEL}
                      </span>
                    </>
                  )}
                  <input
                    id="edit-thumbnail-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const picked = e.target.files?.[0] || null
                      if (picked && picked.size > MAX_THUMBNAIL_BYTES) {
                        setEditError(`Thumbnail must be ${MAX_THUMBNAIL_LABEL} or smaller.`)
                        setNewThumbnail(null)
                        e.target.value = ''
                        return
                      }
                      setEditError(null)
                      setNewThumbnail(picked)
                    }}
                  />
                </label>
                {newThumbnail && (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-gray-500 underline hover:text-gray-800"
                    onClick={() => {
                      setNewThumbnail(null)
                      setThumbnailPreview(editing?.thumbnailUrl || null)
                      const input = document.getElementById(
                        'edit-thumbnail-file',
                      ) as HTMLInputElement | null
                      if (input) input.value = ''
                    }}
                  >
                    Keep current thumbnail
                  </button>
                )}
              </div>

              {editError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {editError}
                </p>
              )}

              <div>
                <label htmlFor="edit-title" className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="edit-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  maxLength={200}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-mood" className="mb-1 block text-sm font-medium text-gray-700">
                    Mood
                  </label>
                  <select
                    id="edit-mood"
                    value={form.mood}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mood: e.target.value as VideoFormPayload['mood'],
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    {MOODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-section"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Section
                  </label>
                  <select
                    id="edit-section"
                    value={form.section}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        section: e.target.value as VideoFormPayload['section'],
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="wisdom">Wisdom</option>
                    <option value="practices">Practices</option>
                  </select>
                </div>
              </div>
              <div className="sticky bottom-0 flex gap-2 border-t border-gray-100 bg-white pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}
