export const PROFILE_PHOTO_KEY = 'ariome-profile-photo';
export const PROFILE_PHOTO_CHANGED_EVENT = 'ariome-profile-photo-changed';

export function readProfilePhoto(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(PROFILE_PHOTO_KEY);
  } catch {
    return null;
  }
}

export function notifyProfilePhotoChanged(dataUrl: string | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PROFILE_PHOTO_CHANGED_EVENT, { detail: { dataUrl } }),
  );
}
