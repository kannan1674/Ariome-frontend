'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { I18N_LANGUAGES, DEFAULT_LANGUAGE, Language } from '@/i18n/config';

interface I18nContextType {
  language: Language;
  changeLanguage: (code: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const changeLanguage = (code: string) => {
    const newLanguage = I18N_LANGUAGES.find(lang => lang.code === code);
    if (newLanguage) {
      setLanguage(newLanguage);
    }
  };

  const t = (key: string): string => {
    // Simple translation function - in a real app, you'd load translations from files
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
}
