'use client';

import { useEffect } from 'react';

/**
 * Adds layout/CSS-variable tokens to `document.body` without wiping classes
 * already set by the root layout (`flex`, `min-h-screen`, font, theme, etc.).
 */
export function useBodyClass(className: string) {
  useEffect(() => {
    const tokens = className.trim().split(/\s+/).filter(Boolean);
    const added: string[] = [];

    for (const token of tokens) {
      if (!document.body.classList.contains(token)) {
        document.body.classList.add(token);
        added.push(token);
      }
    }

    return () => {
      for (const token of added) {
        document.body.classList.remove(token);
      }
    };
  }, [className]);
}
