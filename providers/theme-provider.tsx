'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

/** Keep Metronic `data-theme` in sync with next-themes `class` (.dark). */
function ThemeAttributeSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute(
      'data-theme-mode',
      resolvedTheme === 'dark' || resolvedTheme === 'light' ? resolvedTheme : 'system',
    );
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="nextjs-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ThemeAttributeSync />
      {children}
    </NextThemesProvider>
  );
}
