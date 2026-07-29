export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const I18N_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'it',
    name: 'Italiano',
    flag: '🇮🇹'
  },
  {
    code: 'pt',
    name: 'Português',
    flag: '🇵🇹'
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺'
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵'
  },
  {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳'
  }
];

export const DEFAULT_LANGUAGE = I18N_LANGUAGES[0];
