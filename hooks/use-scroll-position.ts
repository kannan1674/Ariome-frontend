'use client';

import { useEffect, useState, useCallback } from 'react';

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updatePosition = useCallback(() => {
    setScrollPosition(window.pageYOffset);
  }, []);

  useEffect(() => {
    // Set initial position
    updatePosition();

    // Add Manage-Eventener with throttling
    let ticking = false;
    const throttledUpdatePosition = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledUpdatePosition, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', throttledUpdatePosition);
  }, [updatePosition]);

  return scrollPosition;
}
