import { showError } from './utils/toast';
import { createSecurityHeaders } from './securityInterceptor';
import { getCookie } from './utils/cookieUtils';
import { isAuthExpiredResponse } from './auth/authenticatedFetch';
import { refreshAccessToken } from './auth/sessionManager';

export interface ClientApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}


// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Generate request key for deduplication
function generateRequestKey(endpoint: string, method: string, body?: unknown): string {
  const bodyString = body ? JSON.stringify(body) : '';
  return `${method}:${endpoint}:${bodyString}`;
}

let csrfToken: string | null = null;

// Reset cached CSRF token so that a fresh value is fetched on next request
export function resetCsrfToken(): void {
  csrfToken = null;
}

async function ensureCsrfToken(): Promise<string | null> {
  if (!csrfToken) {
    try {
      const res = await fetch('/api/auth/csrf', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.error('[ensureCsrfToken] Failed to fetch CSRF token:', error);
    }
  }
  return csrfToken;
}

/**
 * Secure client-side API function - no sensitive headers exposed
 */
export async function clientApiCallWithoutToken<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): Promise<ClientApiResponse<T>> {
  const requestKey = generateRequestKey(endpoint, method, body);
  
  // Check if there's already a pending request for this exact call
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  const requestPromise = (async () => {
    try {
      // Only send essential headers - no sensitive information
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const csrfToken = await ensureCsrfToken();
      if (csrfToken) {
        requestHeaders['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies for auth/CSRF
      });

            // Log security headers from response in browser console - unused, commented out
      // const debugNonce = response.headers.get('X-Debug-Nonce');
      // const debugTimestamp = response.headers.get('X-Debug-Timestamp');
      // const debugSignature = response.headers.get('X-Debug-Signature');

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      let data;
      
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, the response body is already consumed
          // Return error response
          return {
            data: null as T,
            status: response.status,
            ok: false,
            error: 'Invalid JSON response from server'
          };
        }
      } else {
        // Non-JSON response (likely HTML error page)
        const text = await response.text();
        return {
          data: null as T,
          status: response.status,
          ok: false,
          error: response.status === 404 ? 'API endpoint not found' : `Unexpected response format: ${text.substring(0, 100)}`
        };
      }
      
      // Handle 429 Too Many Requests error
      if (response.status === 429) {
        showError('Too many requests. Please try again in a minute');
      }
      
      // Check for error in response data (e.g., {"error":"Event ID is required."})
      const errorMessage = (data as { error?: string })?.error;
      // Don't show toast for "no events available" messages
      if (errorMessage && !errorMessage.toLowerCase().includes('no events available') && 
          !errorMessage.toLowerCase().includes('there are no events available')) {
        showError(errorMessage);
      }
      
      // Check for business logic errors in HttpResponse
      const businessStatusCode = (data as any)?.HttpResponse?.StatusCode;
      const businessMessage = (data as any)?.HttpResponse?.Message;
      const isBusinessError = businessStatusCode && businessStatusCode !== 200;
      
      // Don't show toast for "no events available" messages
      if (isBusinessError && businessMessage && 
          !businessMessage.toLowerCase().includes('no events available') && 
          !businessMessage.toLowerCase().includes('there are no events available')) {
        showError(businessMessage);
      }
      
      return {
        data,
        status: response.status,
        ok: response.ok && !isBusinessError && !errorMessage,
        error: !response.ok ? (errorMessage || 'Request failed') : (isBusinessError ? businessMessage : (errorMessage || undefined))
      };
    } catch (error) {
      console.error('Client API call error:', error);
      console.error('Error details:', {
        endpoint: `/api${endpoint}`,
        method,
        body: body ? JSON.stringify(body).substring(0, 200) + '...' : 'none'
      });
      
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
}

/**
 * Secure client-side API function for routes that need authentication token
 */
async function tryRefreshOnAuthError(parsedBody: unknown, status: number): Promise<string | null> {
  if (!isAuthExpiredResponse(status, parsedBody)) {
    return null;
  }
  const refreshed = await refreshAccessToken();
  if (!refreshed) return null;
  return getCookie('authToken') || null;
}

export async function clientApiCallWithToken<T = unknown>(
  endpoint: string,
  token: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ClientApiResponse<T>> {
  const makeRequest = async (
    currentToken: string,
    isRetry = false,
  ): Promise<ClientApiResponse<T>> => {
    try {
      const csrfToken = await ensureCsrfToken();
      
      const securityHeaders = await createSecurityHeaders();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        // Send token in standard Authorization header expected by API routes
        'Authorization': `Bearer ${currentToken}`,
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        // Add security headers
        ...securityHeaders,
      };
      

      const fetchOptions: RequestInit = {
        method,
        headers,
        ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {}),
        credentials: 'include', // Include cookies for auth/CSRF
      };

      
      const response = await fetch(`/api${endpoint}`, fetchOptions);
   
      
      // Handle 429 Too Many Requests error
      if (response.status === 429) {
        showError('Too many requests. Please try again in a minute');
      }

 
      
      const contentType = response.headers.get('content-type') || '';
      
      let parsedBody;
      try {
        parsedBody = contentType.includes('application/json')
          ? await response.json()
          : { error: await response.text() };
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        parsedBody = { error: 'Failed to parse response' };
      }

      // Check for error in response data (e.g., {"error":"Event ID is required."})
      const errorMessage = (parsedBody as { error?: string })?.error;
      // Don't show toast for "no events available" messages
      if (errorMessage && !errorMessage.toLowerCase().includes('no events available') && 
          !errorMessage.toLowerCase().includes('there are no events available')) {
        showError(errorMessage);
      }

      // Check for HttpResponse error message
      if (parsedBody && typeof parsedBody === 'object' && 'HttpResponse' in parsedBody) {
        const httpResponse = (parsedBody as { HttpResponse?: { StatusCode?: number; Message?: string } }).HttpResponse;
        if (httpResponse && httpResponse.StatusCode && httpResponse.StatusCode !== 200 && httpResponse.Message) {
          // Don't show toast for "no events available" messages
          const message = httpResponse.Message.toLowerCase();
          if (!message.includes('no events available') && 
              !message.includes('there are no events available')) {
          showError(httpResponse.Message);
          }
        }
      }

      if (!response.ok && !isRetry) {
        const newToken = await tryRefreshOnAuthError(parsedBody, response.status);
        if (newToken) {
          return makeRequest(newToken, true);
        }
      }

      return {
        data: parsedBody as T,
        status: response.status,
        ok: response.ok && !errorMessage,
        error: response.ok ? undefined : (errorMessage || `HTTP ${response.status}`)
      };
    } catch (err: unknown) {
      console.error('Error in makeRequest:', err);
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: (err instanceof Error ? err.message : 'Unexpected error occurred while fetching wishlist')
      };
    }
  };

  return makeRequest(token);
}




/**
 * Client-side API function for public routes
 */
export async function clientApiCallPublic<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ClientApiResponse<T>> {
  try {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Include cookies for auth/CSRF
    });

    // Check content type before parsing JSON
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, the response body is already consumed
        // Return error response
        return {
          data: null as T,
          status: response.status,
          ok: false,
          error: 'Invalid JSON response from server'
        };
      }
    } else {
      // Non-JSON response (likely HTML error page)
      const text = await response.text();
      return {
        data: null as T,
        status: response.status,
        ok: false,
        error: response.status === 404 ? 'API endpoint not found' : `Unexpected response format: ${text.substring(0, 100)}`
      };
    }

    // Handle 429 Too Many Requests error
    if (response.status === 429) {
      showError('Too many requests. Please try again in a minute');
    }

    return {
      data: data as T,
      status: response.status,
      ok: response.ok,
      error: !response.ok ? (data as { error?: string })?.error || 'Request failed' : undefined
    };
  } catch (error) {
    console.error('Client API call error:', error);
    return {
      data: null as T,
      status: 500,
      ok: false,
      error: 'Network error or unexpected error occurred'
    };
  }
}

// Example usage functions for common operations

/**
 * Login user (security handled server-side)
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
  public_key?: string;
  fingerprint?: string;
}) {
  return clientApiCallWithoutToken('/login', credentials);
}

/**
 * Register user (security handled server-side)
 */
export async function registerUser(userData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_no: string;
  country: string;
  zip_code: string;
  public_key?: string;
  fingerprint?: string;
}) {
  return clientApiCallWithoutToken('/auth/register', userData);
}

/**
 * Get user profile (requires token)
 */
export async function getUserProfile(token: string) {
  return clientApiCallWithToken('/user/profile', token);
}

/**
 * Get user profile info with security headers (requires token, nonce, timestamp, signature)
 */
export async function getProfileInfoWithSecurity(token: string) {
  // Use the same pattern as clientApiCallWithToken, but for this endpoint
  return clientApiCallWithToken('/profile/get-profile-info', token, undefined, 'GET');
}

/**
 * Update user profile (requires token)
 */
export async function updateUserProfile(token: string, profileData: unknown) {
  return clientApiCallWithToken('/user/profile', token, profileData, 'PUT');
}

/**
 * Get public data (no authentication required)
 */
export async function getPublicData() {
  return clientApiCallPublic('/public/data');
}





