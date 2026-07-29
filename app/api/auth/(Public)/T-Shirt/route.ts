import { NextRequest } from 'next/server';
import { secureServerApiCall } from '@/lib/securityInterceptor';
import { createSecureErrorResponse, createSecureResponse, validateAuthToken } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const eventId = request.nextUrl.searchParams.get('eventId') || '';
    const clubIdParam = request.nextUrl.searchParams.get('clubId');
    const clubId = clubIdParam || process.env.NEXT_PUBLIC_CLUB_ID || '';

    if (!backendUrl) {
      return createSecureErrorResponse('Backend API URL is not configured', 500);
    }

    if (!eventId) {
      return createSecureErrorResponse('Event ID is required', 400);
    }

    const headerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;
    const cookieToken = request.cookies.get('authToken')?.value || null;
    const token = validateAuthToken(headerToken) ? headerToken : (validateAuthToken(cookieToken) ? cookieToken : null);

    const queryParams = new URLSearchParams({ eventId });
    if (clubId) {
      queryParams.append('clubId', clubId);
    }

    const fullUrl = `${backendUrl}/registration/event-tshirts?${queryParams.toString()}`;

    const response = await secureServerApiCall(fullUrl, { method: 'GET' }, token ?? undefined);

    if (!response.ok) {
      return createSecureErrorResponse(response.error || 'Failed to fetch event tshirts', response.status);
    }

    return createSecureResponse(response.data, response.status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error occurred';
    return createSecureErrorResponse(message, 500);
  }
}