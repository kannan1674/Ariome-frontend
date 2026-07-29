import { clientApiCallWithToken } from '@/lib/clientApi';
import { getCookie } from '@/lib/utils/cookieUtils';
import type { AppDispatch } from '@/lib/store';

type RevokeStravaPayload = {
  Notes: string;
};

type HttpEnvelope = {
  HttpResponse?: { StatusCode?: number; Message?: string };
  Message?: string;
  Content?: unknown;
};

/**
 * Revoke Strava consent (same contract as dropdown-menu-user inline call).
 */
export const revokeStravaConsent =
  (data: RevokeStravaPayload) =>
  async (dispatch: AppDispatch): Promise<{ type: string; payload: HttpEnvelope }> => {
    const token = getCookie('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await clientApiCallWithToken(
      '/auth/Strava-Revoke',
      token,
      { Notes: data.Notes },
      'POST'
    );

    if (!response.ok) {
      throw new Error(response.error || 'Failed to revoke Strava consent');
    }

    const payload = (response.data ?? {}) as HttpEnvelope;

    // Keep dispatch signature for typing; no reducer required for this flow.
    void dispatch;

    return { type: 'strava/revokeConsent/fulfilled', payload };
  };
