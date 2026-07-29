import { NextRequest } from 'next/server';
import { secureServerApiCall } from '@/lib/securityInterceptor';
import { validateAuthToken, createSecureResponse, createSecureErrorResponse } from '@/lib/utils';

function normalizeBackendBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

type BackendProfile = {
  displayName?: string;
  genderId?: string;
  bloodGroupId?: string;
  dob?: string;
  address?: string;
  city?: string;
  cityId?: string;
  state?: string;
  stateId?: string;
  country?: string;
  countryId?: string;
  pincode?: string;
};

type BackendUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string | null;
  emailVerified?: boolean;
  role?: 'user' | 'teacher' | 'admin';
  profile?: BackendProfile;
  profileCompletedAt?: string | null;
};

/** Maps Node `GET /api/auth/profile` body to legacy `Content` for Redux `getProfileInfoSuccess`. */
function mapNodeAuthUserToLegacyContent(user: BackendUser) {
  const p = user.profile || {};
  const display =
    p.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    '';
  const pin = p.pincode || '';
  return {
    FirstName: user.firstName ?? '',
    LastName: user.lastName ?? '',
    DisplayName: display,
    Email: user.email ?? '',
    PhoneNumber: user.phone ?? '',
    role: user.role ?? 'user',
    MobileNumber: user.phone ?? '',
    Dob: p.dob ?? '',
    Address: p.address ?? '',
    City: p.city ?? '',
    CityId: p.cityId ?? '',
    State: p.state ?? '',
    StateId: p.stateId ?? '',
    Country: p.country ?? '',
    CountryId: p.countryId ?? '',
    Pincode: pin,
    ZipCode: pin,
    GenderId: p.genderId ?? '',
    BloodGroupId: p.bloodGroupId ?? '',
    Gender: '',
    BloodGroupName: '',
    ProfileImage: '',
  };
}

/**
 * Proxies to Express `GET /api/auth/profile` (Bearer JWT).
 * Returns legacy `{ HttpResponse, Content }` for existing Redux/UI.
 */
export async function GET(req: NextRequest) {
  try {
    const rawAuth = req.headers.get('Authorization');
    const cookieToken = req.cookies.get('authToken')?.value;
    const token = (rawAuth?.replace(/^Bearer\s+/i, '') || cookieToken) ?? null;

    if (!validateAuthToken(token)) {
      return createSecureErrorResponse('Authorization token required', 401);
    }

    const backendBase = normalizeBackendBaseUrl(
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '',
    );
    if (!backendBase) {
      return createSecureErrorResponse(
        'Server configuration error — set BACKEND_URL or NEXT_PUBLIC_API_URL',
        500,
      );
    }

    const profileUrl = `${backendBase}/api/auth/profile`;
    const response = await secureServerApiCall(profileUrl, { method: 'GET' }, token ?? undefined);

    if (!response.ok) {
      const body = response.data as { message?: string; error?: string } | null;
      const msg =
        (body && typeof body === 'object' && (body.message || body.error)) ||
        response.error ||
        'Failed to fetch profile';
      if (response.status === 401 || response.status === 403) {
        return createSecureErrorResponse(String(msg), 401);
      }
      return createSecureErrorResponse(String(msg), response.status || 500);
    }

    const data = response.data as { user?: BackendUser };
    if (!data?.user) {
      return createSecureErrorResponse('Invalid profile response from server', 502);
    }

    const legacy = {
      HttpResponse: { StatusCode: 200, Message: 'Success' },
      Content: mapNodeAuthUserToLegacyContent(data.user),
    };

    return createSecureResponse(legacy);
  } catch (error) {
    console.error('[Profile-info GET]', error);
    return createSecureErrorResponse(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawAuth = req.headers.get('Authorization');
    const token = (rawAuth?.replace(/^Bearer\s+/i, '') || req.cookies.get('authToken')?.value) ?? null;

    if (!validateAuthToken(token)) {
      return createSecureErrorResponse('Authorization token required', 401);
    }
    const body = await req.json();
    const backendBase = normalizeBackendBaseUrl(
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '',
    );
    if (!backendBase) {
      return createSecureErrorResponse('Backend API URL is not configured', 500);
    }

    const response = await secureServerApiCall(
      `${backendBase}/api/auth/profile`,
      {
        method: 'GET',
      },
      token ?? undefined,
    );

    if (!response.ok) {
      return createSecureErrorResponse(response.error || 'API request failed', response.status);
    }

    const data = response.data as { user?: BackendUser };
    if (!data?.user) {
      return createSecureErrorResponse('Invalid profile response from server', 502);
    }

    const legacy = {
      HttpResponse: { StatusCode: 200, Message: 'Success' },
      Content: mapNodeAuthUserToLegacyContent(data.user),
    };

    return createSecureResponse(legacy);
  } catch (error) {
    console.error('Profile API error:', error);
    return createSecureErrorResponse(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
}
