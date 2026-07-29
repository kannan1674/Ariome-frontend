'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface Settings {
  container: 'fixed' | 'fluid';
  layouts: {
    demo2: {
      headerStickyOffset: number;
    };
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  setOption: (key: string, value: any) => void;
}

const defaultSettings: Settings = {
  container: 'fixed',
  layouts: {
    demo2: {
      headerStickyOffset: 100,
    },
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const setOption = useCallback((key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      // Handle nested property setting
      if (key.includes('.')) {
        const keys = key.split('.');
        let current: any = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        (newSettings as any)[key] = value;
      }
      return newSettings;
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    setOption
  }), [settings, updateSettings, setOption]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
