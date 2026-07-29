'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchShortVideoVoice, fetchShortsScripts } from '@/lib/content/contentApi';
import type { ShortScript } from '@/lib/content/types';
import { renderShortVideo } from '@/lib/videos/renderShortVideo';
import { Check, Clapperboard, Copy, Loader2, Sparkles, Upload, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const MOODS = ['Peaceful', 'Grateful', 'Hopeful', 'Joyful', 'Reflective', 'Anxious'] as const;

const TOPIC_CHIPS = [
  'morning calm',
  'anxiety reset',
  'gratitude',
  'sleep tip',
  'breath work',
  'self-compassion',
] as const;

type Props = {
  mood: string;
  onApplyToUpload?: (payload: {
    title: string;
    description: string;
    teleprompter: string;
  }) => void;
  onVideoGenerated?: (file: File, durationSeconds: number, thumbnail: File | null) => void;
  className?: string;
};

function buildUploadDescription(s: ShortScript) {
  const lines = [s.hook, '', s.script, '', '---', `Shot notes: ${s.visualNotes}`, `Hashtags: ${s.hashtags.join(' ')}`];
  return lines.join('\n');
}

function buildTeleprompter(s: ShortScript) {
  return `${s.hook}\n\n${s.script}`;
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export default function ShortsStudio({ mood, onApplyToUpload, onVideoGenerated, className }: Props) {
  const [topic, setTopic] = useState('mindfulness');
  const [selectedMood, setSelectedMood] = useState(mood);
  const [shorts, setShorts] = useState<ShortScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMood(mood);
  }, [mood]);

  const generateScripts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShortsScripts(topic.trim() || 'mindfulness', selectedMood, 3);
      setShorts(data.shorts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const applyToUpload = (id: string, s: ShortScript) => {
    onApplyToUpload?.({
      title: s.title,
      description: buildUploadDescription(s),
      teleprompter: buildTeleprompter(s),
    });
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 2500);
  };

  const generateVideo = async (cardId: string, s: ShortScript) => {
    if (!onVideoGenerated) return;
    setGeneratingId(cardId);
    setGenProgress('Writing voice…');
    setError(null);
    applyToUpload(cardId, s);

    try {
      const spoken = `${s.hook}. ${s.script}`;
      let audioBlob: Blob | null = null;

      try {
        const voice = await fetchShortVideoVoice(spoken);
        if (voice.hasVoice && voice.audioBase64) {
          audioBlob = base64ToBlob(voice.audioBase64, voice.mimeType || 'audio/mpeg');
        }
      } catch (voiceErr) {
        setGenProgress('Voice unavailable — creating captioned video…');
        await new Promise((r) => setTimeout(r, 800));
        if (!(voiceErr instanceof Error) || !voiceErr.message.includes('OPENAI')) {
          // continue without voice
        }
      }

      const result = await renderShortVideo(
        { title: s.title, hook: s.hook, script: s.script, mood: s.mood },
        audioBlob,
        setGenProgress,
      );

      onVideoGenerated(result.file, result.durationSeconds, result.thumbnail);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate video');
    } finally {
      setGeneratingId(null);
      setGenProgress(null);
    }
  };

  return (
    <section
      className={cn(
        'mb-6 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white p-5 shadow-sm',
        className,
      )}
      aria-labelledby="shorts-studio-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
          <Clapperboard className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id="shorts-studio-heading" className="text-lg font-semibold text-gray-900">
            Generate short video
          </h2>
          <p className="mt-0.5 text-sm text-gray-600">
            AI script + voice + captions → a vertical video file ready to publish (no camera).
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TOPIC_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setTopic(chip)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium capitalize transition',
              topic === chip
                ? 'border-rose-300 bg-rose-100 text-rose-900'
                : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200',
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Custom topic…"
          className="min-w-[140px] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => void generateScripts()}
          disabled={loading || !!generatingId}
          className="bg-rose-600 hover:bg-rose-500"
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
          Generate script
        </Button>
      </div>

      {genProgress && (
        <p className="mt-3 flex items-center gap-2 text-sm text-rose-800">
          <Loader2 className="size-4 animate-spin" />
          {genProgress}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 space-y-4">
        {shorts.map((s, i) => {
          const cardId = `short-${i}`;
          const isGenerating = generatingId === cardId;

          return (
            <article key={cardId} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    {s.durationSec}s · {s.mood}
                  </p>
                  <h3 className="mt-1 font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium text-rose-800">&ldquo;{s.hook}&rdquo;</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyText(`${cardId}-all`, buildUploadDescription(s))}
                    className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"
                    title="Copy full script"
                    aria-label="Copy full script"
                  >
                    <Copy className="size-4" />
                  </button>
                  {onVideoGenerated && (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-500"
                      disabled={!!generatingId}
                      onClick={() => void generateVideo(cardId, s)}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="mr-1 size-3.5" />
                      )}
                      {isGenerating ? 'Generating…' : 'Generate video'}
                    </Button>
                  )}
                  {onApplyToUpload && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-teal-200 text-teal-800 hover:bg-teal-50"
                      onClick={() => applyToUpload(cardId, s)}
                    >
                      {appliedId === cardId ? (
                        <Check className="mr-1 size-3.5" />
                      ) : (
                        <Upload className="mr-1 size-3.5" />
                      )}
                      {appliedId === cardId ? 'Applied' : 'Text only'}
                    </Button>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{s.script}</p>
              <p className="mt-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">Shots:</span> {s.visualNotes}
              </p>
              <p className="mt-2 text-xs text-rose-700">{s.hashtags.join(' ')}</p>

              {copied === `${cardId}-all` && <p className="mt-1 text-xs text-emerald-600">Copied to clipboard</p>}
            </article>
          );
        })}
      </div>

      {shorts.length === 0 && !loading && (
        <p className="mt-4 rounded-xl border border-dashed border-rose-200 py-6 text-center text-sm text-gray-500">
          Pick a topic, generate a script, then tap <strong>Generate video</strong> — no recording needed.
        </p>
      )}
    </section>
  );
}
