'use client'

import { Button } from '@/components/ui/button'
import { fetchAllVideos } from '@/lib/admin/adminApi'
import { deleteVideo, formatVideoDate, formatVideoSize } from '@/lib/videos/teacherApi'
import type { TeacherVideo } from '@/lib/videos/types'
import { formatWatchTime } from '@/lib/videos/watchTime'
import { Clock, ExternalLink, Eye, Film, Loader2, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<TeacherVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAllVideos()
      setVideos(list)
    } catch {
      setError('Could not load videos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-gray-900">All videos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Every video published by teachers across the platform.
        </p>
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
          <Loader2 className="size-8 animate-spin text-indigo-600" aria-label="Loading" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <Film className="mx-auto size-10 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-900">No videos yet</p>
          <p className="mt-1 text-sm text-gray-500">Videos will appear here when teachers upload.</p>
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
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-800 to-violet-900">
                      <Film className="size-7 text-white/80" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-gray-900">{video.title}</h2>
                  <p className="text-xs text-indigo-600">{video.teacherName || 'Unknown teacher'}</p>
                  {video.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{video.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      <Eye className="size-3" />
                      {(video.viewCount ?? 0).toLocaleString()} views
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                      <Clock className="size-3" />
                      {formatWatchTime(video.watchTimeSeconds ?? 0)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{video.mood}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{video.section}</span>
                    <span>{formatVideoSize(video.size)}</span>
                    <span>{formatVideoDate(video.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 size-3.5" />
                    Open
                  </a>
                </Button>
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
    </div>
  )
}
