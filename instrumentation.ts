/**
 * Node 22+ exposes a global `localStorage` that breaks SSR when getItem is not a function.
 * Remove it on the server so only real browser storage is used in the client.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const ls = globalThis.localStorage as Storage | undefined;
  if (!ls) return;

  try {
    if (typeof ls.getItem !== 'function') {
      // @ts-expect-error — drop broken experimental stub
      delete globalThis.localStorage;
    }
  } catch {
    // @ts-expect-error
    delete globalThis.localStorage;
  }
}
