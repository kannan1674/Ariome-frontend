import type { Locale } from '../locales';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { hi } from './hi';
import { ta } from './ta';
import type { Messages } from './en';

const catalogs: Record<Locale, Messages> = { en, es, fr, hi, ta };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

export type { Messages };
