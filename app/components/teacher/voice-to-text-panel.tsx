'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n/locales';
import { translateText } from '@/lib/i18n/translateApi';
import {
  SPEECH_LANGUAGES,
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  localeFromSpeechCode,
} from '@/lib/voice/speechRecognition';
import { Languages, Loader2, Mic, MicOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  onTitle?: (text: string) => void;
  onDescription?: (text: string) => void;
  className?: string;
};

export default function VoiceToTextPanel({ onTitle, onDescription, className }: Props) {
  const [speechLang, setSpeechLang] = useState('en-US');
  const [translateTo, setTranslateTo] = useState<Locale | 'none'>('none');
  const [target, setTarget] = useState<'title' | 'description'>('description');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => stopListening(), [stopListening]);

  const applyText = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      let finalText = trimmed;
      if (translateTo !== 'none') {
        setBusy(true);
        setStatus('Translating…');
        try {
          const sourceLocale = localeFromSpeechCode(speechLang);
          const result = await translateText(trimmed, translateTo, sourceLocale);
          finalText = result.translatedText || trimmed;
        } catch {
          setStatus('Translation failed — using original speech text.');
          finalText = trimmed;
        } finally {
          setBusy(false);
        }
      }

      if (target === 'title') onTitle?.(finalText);
      else onDescription?.(finalText);

      setStatus(
        translateTo !== 'none'
          ? `Added to ${target} (${LOCALE_LABELS[translateTo]})`
          : `Added to ${target}`,
      );
      setInterim('');
    },
    [onDescription, onTitle, speechLang, target, translateTo],
  );

  const startListening = () => {
    if (!supported || listening) return;
    setStatus(null);
    setInterim('');

    const recognition = createSpeechRecognition(speechLang);
    if (!recognition) {
      setStatus('Speech recognition is not available in this browser.');
      return;
    }

    recognitionRef.current = recognition;
    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalTranscript += t;
        else interimText += t;
      }
      setInterim(finalTranscript || interimText);
    };

    recognition.onerror = () => {
      setStatus('Could not capture speech. Try again.');
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (finalTranscript.trim()) void applyText(finalTranscript);
    };

    recognition.start();
    setListening(true);
    setStatus('Listening… speak now');
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Mic className="size-5 text-violet-600" aria-hidden />
        <h3 className="text-sm font-semibold text-gray-900">Voice to text</h3>
      </div>
      <p className="mt-1 text-xs text-gray-600">
        Dictate in any language, then optionally translate into another language for title or description.
      </p>

      {!supported && (
        <p className="mt-3 text-xs text-amber-800">
          Use Chrome or Edge for voice input. Safari support is limited.
        </p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-gray-700">
          Speak in
          <select
            value={speechLang}
            onChange={(e) => setSpeechLang(e.target.value)}
            disabled={listening || busy}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {SPEECH_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-gray-700">
          Translate to
          <select
            value={translateTo}
            onChange={(e) => setTranslateTo(e.target.value as Locale | 'none')}
            disabled={listening || busy}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            <option value="none">Same language (no translation)</option>
            {SUPPORTED_LOCALES.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs font-medium text-gray-600">Fill:</span>
        {(['title', 'description'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTarget(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold capitalize',
              target === t
                ? 'border-violet-500 bg-violet-50 text-violet-800'
                : 'border-gray-200 text-gray-600',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {interim && (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm italic text-gray-700">&ldquo;{interim}&rdquo;</p>
      )}

      {status && <p className="mt-2 text-xs text-violet-800">{status}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!supported || busy}
          onClick={listening ? stopListening : startListening}
          className={cn(listening && 'border-red-300 bg-red-50 text-red-700')}
        >
          {busy ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : listening ? (
            <MicOff className="mr-2 size-4" />
          ) : (
            <Mic className="mr-2 size-4" />
          )}
          {listening ? 'Stop' : 'Start voice input'}
        </Button>
        {translateTo !== 'none' && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Languages className="size-3.5" />
            AI translation enabled
          </span>
        )}
      </div>
    </div>
  );
}
