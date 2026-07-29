'use client'

import { fetchTeacherFeedback, formatEngagementDate } from '@/lib/videos/engagementApi'
import type { TeacherFeedback } from '@/lib/videos/engagementTypes'
import { formatWatchTime } from '@/lib/videos/watchTime'
import { Clock, Heart, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function TeacherFeedbackPage() {
  const [data, setData] = useState<TeacherFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTeacherFeedback()
      if (!result) {
        setError('Could not load comments and likes.')
        return
      }
      setData(result)
    } catch {
      setError('Could not load comments and likes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Engagement</h1>
        <p className="mt-1 text-sm text-gray-600">
          Likes, comments, and watch time on your uploaded videos.
        </p>
      </div>

      {data && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Watch time</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-amber-600">
              <Clock className="size-5" />
              {formatWatchTime(data.totals.watchTimeSeconds ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total likes</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-rose-600">
              <Heart className="size-5 fill-current" />
              {data.totals.likes}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Comments</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-teal-600">
              <MessageCircle className="size-5" />
              {data.totals.comments}
            </p>
          </div>
        </div>
      )}

      {data && data.perVideo.length > 0 && (
        <ul className="mb-6 space-y-2">
          {data.perVideo.map((v) => (
            <li
              key={String(v.videoId)}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
            >
              <span className="truncate font-medium text-gray-900">{v.title}</span>
              <span className="shrink-0 text-xs text-gray-500">
                {formatWatchTime(v.watchTimeSeconds)} · {v.viewCount} views · {v.likeCount} likes ·{' '}
                {v.commentCount} comments
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-teal-600" aria-label="Loading" />
        </div>
      ) : !data?.feedback.length ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <MessageCircle className="mx-auto size-10 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-900">No feedback yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When users watch, like, or comment on your videos on Explore, activity will appear here.
          </p>
          <Link
            href="/teacher"
            className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Go to Upload →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.feedback.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
                {item.videoTitle}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">{item.authorName}</span>
                <span className="text-[10px] text-gray-400">
                  {formatEngagementDate(item.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{item.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
