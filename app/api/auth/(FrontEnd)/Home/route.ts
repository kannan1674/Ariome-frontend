import { NextRequest } from 'next/server';
// import { cookies } from 'next/headers';
import { secureServerApiCall, createSecurityHeaders } from '@/lib/securityInterceptor';
import { validateAuthToken, createSecureResponse, createSecureErrorResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  
  try {
    // This is a public endpoint - authentication is optional
    const rawAuth = req.headers.get('Authorization');
    const cookieToken = req.cookies.get('authToken')?.value;
    const token = (rawAuth?.replace(/^Bearer\s+/i, '') || cookieToken) ?? null;
    
    // Token is optional for public endpoint - we'll send it if available but won't require it

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return createSecureErrorResponse('Backend API URL is not configured', 500);
    }

    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!clientId) {
      return createSecureErrorResponse('Client ID is not configured', 500);
    }

    const defaultClubId = process.env.NEXT_PUBLIC_CLUB_ID || '1';

    // Read request body or use default values
    // Note: client_id and client_secret go in HEADERS, NOT in body (like Swagger shows)
    let requestBody = {
      "PageNo": 0,
      "PageSize": 0,
      "Keyword": "",
      "Type": "",
      "ClubId": defaultClubId
    };

    // Try to read request body if present
    // Check Content-Type first to avoid 415 errors
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        // Clone request to avoid "body already consumed" errors if needed later
        const clonedReq = req.clone();
        const parsedBody = await clonedReq.json();
        if (parsedBody && typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0) {
          // Merge with defaults, but remove client_id from body (it goes in headers)
          // If ClubId is empty, use the default
          const { client_id, client_secret, ...bodyWithoutClientId } = parsedBody;
          requestBody = { 
            ...requestBody, 
            ...bodyWithoutClientId, 
            ClubId: parsedBody.ClubId || defaultClubId
          };
        }
      } catch (error) {
        // If body is empty or parsing fails, use defaults
        // This is OK - we'll use the default requestBody
        console.warn('⚠️ [Home Route] Could not parse JSON body, using defaults:', error);
      }
    } else if (contentType) {
      // Content-Type is set but not JSON - this might cause issues
      console.warn('⚠️ [Home Route] Unexpected Content-Type:', contentType);
    }
    
    // Generate and log security headers (signature, nonce, timestamp)
    const securityHeaders = await createSecurityHeaders();
      // Use the public home/events endpoint
    const adminMemberListUrl = `${backendUrl}/public/home/events`;

    // Prepare headers for backend request - client_id and client_secret MUST be in headers (like Swagger)
    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
    if (!clientSecret) {
      return createSecureErrorResponse('Client Secret is not configured', 500);
    }

    const backendHeaders: Record<string, string> = {
      'client_id': clientId,
      'client_secret': clientSecret
    };

  
    const response = await secureServerApiCall(adminMemberListUrl, {
      method: 'POST',
      headers: Object.keys(backendHeaders).length > 0 ? backendHeaders : undefined,
      body: JSON.stringify(requestBody)
    }, undefined); // Don't send token to public endpoint

    // Check if response contains error about client_id
    if (response.data && typeof response.data === 'object') {
      const responseData = response.data as any;
      if (responseData.HttpResponse && responseData.HttpResponse.Message) {
        const message = responseData.HttpResponse.Message;
        if (message.includes('client_id') || message.includes('client id')) {
          console.error('❌ [Home Route] Backend error about client_id:', message);
        }
      }
    }

    // Handle empty response or error response
    if (!response.ok) {
      let errorMessage = response.error || 'API request failed';
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as any;
        if (responseData.HttpResponse?.Message) {
          errorMessage = responseData.HttpResponse.Message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }
      console.error('❌ [Home Route] API Error:', errorMessage, 'Status:', response.status);
      return createSecureErrorResponse(errorMessage, response.status);
    }

    // Handle empty or null response data
    const responseData = response.data as any;
    if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0 && !responseData?.Content)) {
      console.warn('⚠️ [Home Route] Empty or null response data received, returning empty events structure');
      return createSecureResponse({
        Content: {
          PublicHomeEventListRecords: []
        },
        HttpResponse: {
          StatusCode: 200,
          Message: 'No events found'
        }
      });
    }

    // Return the response data as-is
    return createSecureResponse(response.data);
  } catch (error) {
    return createSecureErrorResponse(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get eventId from query parameters
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const clubId = searchParams.get('clubId');
    // Prefer Authorization header; fallback to cookie named 'authToken'
    // Token is optional for public endpoint - we'll send it if available but won't require it
    const rawAuth = req.headers.get('Authorization');
    const cookieToken = req.cookies.get('authToken')?.value;
    const token = (rawAuth?.replace(/^Bearer\s+/i, '') || cookieToken) ?? null;
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return createSecureErrorResponse('Backend API URL is not configured', 500);
    }

    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!clientId) {
      return createSecureErrorResponse('Client ID is not configured', 500);
    }

    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
    if (!clientSecret) {
      return createSecureErrorResponse('Client Secret is not configured', 500);
    }

    // Validate that eventId is present
    if (!eventId) {
        return createSecureErrorResponse('EventId is required', 400);
    }

    const defaultClubId = process.env.NEXT_PUBLIC_CLUB_ID || '1';

    // Build URL - backend might expect POST with eventId in body
    const baseUrl = `${backendUrl}/public/home/event-info`;
    
    // Prepare headers for backend request - client_id and client_secret MUST be in headers
    const backendHeaders: Record<string, string> = {
      'client_id': clientId,
      'client_secret': clientSecret
    };

    // Prepare request body with eventId - use default clubId if not provided
    const requestBody = {
        eventId: eventId,
        clubId: clubId || defaultClubId
    };

    // Generate and log security headers (signature, nonce, timestamp)
    // Note: secureServerApiCall will also generate its own headers, but we log here for visibility
    const securityHeaders = await createSecurityHeaders();
    // Try POST first (most APIs use POST for event-info)
    let response = await secureServerApiCall(
      baseUrl, 
      { 
        method: 'POST',
        headers: backendHeaders,
        body: JSON.stringify(requestBody)
      }, 
      token ?? undefined
    );
    
    // If POST fails, try GET with query parameter
    if (!response.ok && (response.status === 400 || response.status === 405)) {
      const queryParams = new URLSearchParams();
      if (eventId) queryParams.append('eventId', eventId);
      if (clubId) queryParams.append('clubId', clubId);
      const getUrl = `${baseUrl}?${queryParams.toString()}`;
      response = await secureServerApiCall(
        getUrl, 
        { 
          method: 'GET',
          headers: backendHeaders
        }, 
        token ?? undefined
      );
    }

    if (!response.ok) {
      return createSecureErrorResponse(response.error || 'API request failed', response.status);
    }

    return createSecureResponse(response.data);
  } catch (error) {
    return createSecureErrorResponse(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
}