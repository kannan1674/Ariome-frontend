/** True only in the browser with a working Storage API (avoids Node 25 SSR stub). */
export function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ls = window.localStorage;
    return typeof ls?.getItem === 'function' && typeof ls?.setItem === 'function';
  } catch {
    return false;
  }
}

export function getLocalStorageItem(key: string): string | null {
  if (!canUseLocalStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

export function removeLocalStorageItem(key: string): void {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
