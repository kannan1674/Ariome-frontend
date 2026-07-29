'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  fetchVideoEngagement,
  formatEngagementDate,
  postVideoComment,
  toggleVideoLike,
} from '@/lib/videos/engagementApi'
import type { VideoComment } from '@/lib/videos/engagementTypes'
import { Heart, Loader2, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type Props = {
  videoId: string
  className?: string
}

export default function VideoEngagementPanel({ videoId, className }: Props) {
  const [likeCount, setLikeCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [comments, setComments] = useState<VideoComment[]>([])
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const data = await fetchVideoEngagement(videoId)
    if (!data) {
      setError('Could not load likes and comments.')
      setLoading(false)
      return
    }
    setLikeCount(data.likeCount)
    setLikedByMe(data.likedByMe)
    setComments(data.comments)
    setLoading(false)
  }, [videoId])

  useEffect(() => {
    void load()
  }, [load])

  const onLike = async () => {
    setLikeLoading(true)
    const result = await toggleVideoLike(videoId)
    setLikeLoading(false)
    if (!result) return
    setLikedByMe(result.liked)
    setLikeCount(result.likeCount)
  }

  const onSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return

    setPosting(true)
    setError(null)
    const result = await postVideoComment(videoId, text)
    setPosting(false)

    if (!result.ok) {
      setError(result.error || 'Could not post comment')
      return
    }

    setCommentText('')
    await load()
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-white/10 bg-black/30 p-3 text-left sm:p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={likeLoading || loading}
          onClick={() => void onLike()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition',
            likedByMe
              ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40'
              : 'bg-white/10 text-white hover:bg-white/15',
          )}
        >
          {likeLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart className={cn('size-4', likedByMe && 'fill-current')} />
          )}
          {likeCount}
        </button>
        <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
          <MessageCircle className="size-4" />
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={onSubmitComment} className="mt-3 flex gap-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          disabled={posting || loading}
          className="min-w-0 flex-1 rounded-lg border border-[var(--ariome-border)] bg-[var(--ariome-surface)] px-3 py-2 text-sm text-[var(--ariome-text)] placeholder:text-[var(--ariome-text-faint)] outline-none focus:border-[var(--ariome-gold)] focus:ring-1 focus:ring-[var(--ariome-gold-muted)]"
        />
        <Button
          type="submit"
          size="sm"
          disabled={posting || loading || !commentText.trim()}
          className="ariome-btn-primary shrink-0 rounded-lg"
        >
          {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-center text-xs text-white/45">Be the first to comment.</p>
      ) : (
        <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-white/5 px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-teal-200">{c.authorName}</span>
                <span className="shrink-0 text-[10px] text-white/40">
                  {formatEngagementDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-sm leading-snug text-white/85">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
