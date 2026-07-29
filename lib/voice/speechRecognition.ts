import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/locales';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export type SpeechLangOption = { code: string; label: string; locale?: Locale };

/** BCP-47 tags for Web Speech API */
export const SPEECH_LANGUAGES: SpeechLangOption[] = [
  { code: 'en-US', label: 'English (US)', locale: 'en' },
  { code: 'en-GB', label: 'English (UK)', locale: 'en' },
  { code: 'es-ES', label: 'Español', locale: 'es' },
  { code: 'fr-FR', label: 'Français', locale: 'fr' },
  { code: 'hi-IN', label: 'हिन्दी', locale: 'hi' },
  { code: 'ta-IN', label: 'தமிழ்', locale: 'ta' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'ar-SA', label: 'العربية' },
];

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
}

export function createSpeechRecognition(lang: string) {
  const Ctor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
      : null;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

export function localeFromSpeechCode(code: string): Locale {
  const base = code.split('-')[0];
  return SUPPORTED_LOCALES.includes(base as Locale) ? (base as Locale) : 'en';
}
