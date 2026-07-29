'use client'

import { fetchDashboard } from '@/lib/admin/adminApi'
import type { AdminDashboard } from '@/lib/admin/types'
import { formatVideoDate } from '@/lib/videos/teacherApi'
import { formatWatchTime } from '@/lib/videos/watchTime'
import { Clock, Eye, Film, LayoutDashboard, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

function StatCard({
  label,
  value,
  displayValue,
  icon: Icon,
  accent,
}: {
  label: string
  value?: number
  displayValue?: string
  icon: typeof Users
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            {displayValue ?? value?.toLocaleString()}
          </p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dashboard = await fetchDashboard()
      if (!dashboard) {
        setError('Could not load dashboard.')
        return
      }
      setData(dashboard)
    } catch {
      setError('Could not load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const stats = data?.stats

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-6 text-indigo-600" />
          <h1 className="font-serif text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-gray-600">Platform overview and video performance.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-indigo-600" aria-label="Loading" />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Total users"
              value={stats.totalUsers}
              icon={Users}
              accent="bg-indigo-600"
            />
            <StatCard
              label="Total videos"
              value={stats.totalVideos}
              icon={Film}
              accent="bg-violet-600"
            />
            <StatCard
              label="Total views"
              value={stats.totalViews}
              icon={Eye}
              accent="bg-teal-600"
            />
            <StatCard
              label="Watch time"
              displayValue={formatWatchTime(stats.totalWatchTimeSeconds ?? 0)}
              icon={Clock}
              accent="bg-amber-600"
            />
          </div>

          <section className="mt-8" aria-labelledby="video-views-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="video-views-heading" className="text-sm font-semibold text-gray-900">
                Performance by video
              </h2>
              <Link
                href="/admin/videos"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage all →
              </Link>
            </div>

            {!data.videos.length ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
                No videos yet. Views will appear when users watch teacher uploads on Explore.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.videos.map((video, index) => (
                  <li
                    key={video.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {index + 1}
                    </span>
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-800 to-violet-900">
                          <Film className="size-5 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{video.title}</p>
                      <p className="truncate text-xs text-gray-500">{video.teacherName}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {formatVideoDate(video.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-indigo-600">
                        {video.viewCount.toLocaleString()} views
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-amber-700">
                        {formatWatchTime(video.watchTimeSeconds ?? 0)}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        watch time
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
