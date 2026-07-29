'use client';

import { useEffect, useState } from 'react';

/** True on devices with a fine pointer and hover (desktop), false on most phones. */
export function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return canHover;
}
