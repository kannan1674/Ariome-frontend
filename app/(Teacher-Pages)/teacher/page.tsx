'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MAX_THUMBNAIL_BYTES,
  MAX_THUMBNAIL_LABEL,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_LABEL,
  VIDEO_UPLOAD_ACCEPT,
  VIDEO_UPLOAD_FORMATS_LABEL,
  isAllowedVideoFile,
} from '@/lib/videos/constants'
import { uploadVideo } from '@/lib/videos/uploadVideo'
import {
  generateThumbnailFromVideoFile,
  getVideoDurationFromFile,
} from '@/lib/videos/videoMetadata'
import ShortsStudio from '@/app/components/teacher/shorts-studio'
import VoiceToTextPanel from '@/app/components/teacher/voice-to-text-panel'
import { ImageIcon, Loader2, Upload, Video } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const MOODS = ['Peaceful', 'Grateful', 'Hopeful', 'Joyful', 'Reflective', 'Anxious'] as const

export default function TeacherUploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState<(typeof MOODS)[number]>('Peaceful')
  const [section, setSection] = useState<'wisdom' | 'practices'>('wisdom')
  const [file, setFile] = useState<File | null>(null)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview(null)
      return
    }
    const url = URL.createObjectURL(thumbnail)
    setThumbnailPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnail])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!file) {
      setError('Choose a video file to upload.')
      return
    }
    let thumbToUpload = thumbnail
    if (!thumbToUpload && file) {
      setMessage('Generating thumbnail from video…')
      thumbToUpload = await generateThumbnailFromVideoFile(file)
      if (thumbToUpload) setThumbnail(thumbToUpload)
    }
    if (!thumbToUpload) {
      setError(
        'Add a thumbnail image (JPG/PNG), or use Chrome to upload — we could not read a frame from this video file.',
      )
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`Video must be ${MAX_VIDEO_LABEL} or smaller.`)
      return
    }
    if (thumbToUpload.size > MAX_THUMBNAIL_BYTES) {
      setError(`Thumbnail must be ${MAX_THUMBNAIL_LABEL} or smaller.`)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const data = await uploadVideo(
        {
          file,
          thumbnail: thumbToUpload,
          title: title.trim(),
          description: description.trim(),
          mood,
          section,
          durationSeconds,
        },
        setUploadProgress,
      )
      if (data.error) throw new Error(data.error)

      setMessage(data.message || 'Video published. Students will see it on Explore shortly.')
      setTitle('')
      setDescription('')
      setFile(null)
      setDurationSeconds(0)
      setThumbnail(null)
      const videoInput = document.getElementById('teacher-video-file') as HTMLInputElement | null
      const thumbInput = document.getElementById('teacher-thumbnail-file') as HTMLInputElement | null
      if (videoInput) videoInput.value = ''
      if (thumbInput) thumbInput.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Upload video</h1>
        <p className="mt-1 text-sm text-gray-600">
          Published videos appear on Explore for all users.
        </p>
      </div>

      <VoiceToTextPanel
        className="mb-6"
        onTitle={(text) => setTitle(text)}
        onDescription={(text) => setDescription((prev) => (prev ? `${prev}\n${text}` : text))}
      />

      <ShortsStudio
        mood={mood}
        onApplyToUpload={({ title: t, description: d }) => {
          setTitle(t)
          setDescription(d)
        }}
        onVideoGenerated={(videoFile, duration, thumb) => {
          setFile(videoFile)
          setDurationSeconds(duration)
          if (thumb) setThumbnail(thumb)
          setMessage('Short video generated — review below and tap Publish.')
          setError(null)
        }}
      />

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="Morning meditation"
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="Short description for users"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mood" className="mb-1.5 block text-sm font-medium text-gray-700">
              Mood
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value as (typeof MOODS)[number])}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="section" className="mb-1.5 block text-sm font-medium text-gray-700">
              Section
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value as 'wisdom' | 'practices')}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              <option value="wisdom">Wisdom &amp; Insights</option>
              <option value="practices">Guided Practices</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="teacher-thumbnail-file" className="mb-1.5 block text-sm font-medium text-gray-700">
            Thumbnail image
          </label>
          <label
            htmlFor="teacher-thumbnail-file"
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 transition hover:border-teal-400 hover:bg-teal-50/30',
              thumbnail && 'border-teal-500',
            )}
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="aspect-video w-full max-h-48 rounded-lg object-cover"
              />
            ) : (
              <>
                <ImageIcon className="size-8 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                  JPG, PNG, or WebP (max {MAX_THUMBNAIL_LABEL})
                </span>
              </>
            )}
            <input
              id="teacher-thumbnail-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const picked = e.target.files?.[0] || null
                if (picked && picked.size > MAX_THUMBNAIL_BYTES) {
                  setError(`Thumbnail must be ${MAX_THUMBNAIL_LABEL} or smaller.`)
                  setThumbnail(null)
                  e.target.value = ''
                  return
                }
                setError(null)
                setThumbnail(picked)
              }}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Shown on Explore before users play your video. If you skip this, we try to capture a frame
            from your video (MKV works best in Chrome).
          </p>
        </div>

        <div>
          <label htmlFor="teacher-video-file" className="mb-1.5 block text-sm font-medium text-gray-700">
            Video file
          </label>
          <label
            htmlFor="teacher-video-file"
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 transition hover:border-teal-400 hover:bg-teal-50/30',
              file && 'border-teal-500 bg-teal-50/40',
            )}
          >
            <Upload className="size-8 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">
              {file ? file.name : `Tap to choose ${VIDEO_UPLOAD_FORMATS_LABEL} (max ${MAX_VIDEO_LABEL})`}
            </span>
            <input
              id="teacher-video-file"
              type="file"
              accept={VIDEO_UPLOAD_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const picked = e.target.files?.[0] || null
                if (picked && !isAllowedVideoFile(picked)) {
                  setError(`Choose a supported video: ${VIDEO_UPLOAD_FORMATS_LABEL}.`)
                  setFile(null)
                  setDurationSeconds(0)
                  e.target.value = ''
                  return
                }
                if (picked && picked.size > MAX_VIDEO_BYTES) {
                  setError(`Video must be ${MAX_VIDEO_LABEL} or smaller.`)
                  setFile(null)
                  setDurationSeconds(0)
                  e.target.value = ''
                  return
                }
                setError(null)
                setMessage(null)
                setFile(picked)
                if (picked) {
                  void getVideoDurationFromFile(picked).then(setDurationSeconds)
                  if (!thumbnail) {
                    void generateThumbnailFromVideoFile(picked).then((auto) => {
                      if (auto) {
                        setThumbnail(auto)
                        setMessage('Thumbnail auto-generated from your video. Replace it below if you like.')
                      }
                    })
                  }
                } else {
                  setDurationSeconds(0)
                }
              }}
            />
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
            {message}
          </p>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Uploading</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-[width] duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={uploading} className="w-full bg-teal-600 hover:bg-teal-700">
          {uploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Uploading…'}
            </>
          ) : (
            <>
              <Video className="mr-2 size-4" />
              Publish
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        <Link href="/teacher/videos" className="font-semibold text-teal-600 hover:text-teal-700">
          View &amp; manage your videos →
        </Link>
      </p>
    </div>
  )
}
