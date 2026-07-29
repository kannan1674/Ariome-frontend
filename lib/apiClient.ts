import { NextRequest } from 'next/server';
import 'server-only';

// Types for different API call configurations
export interface ApiCallConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
  requireAuth?: boolean;
  requireHeaders?: boolean;
  customHeaders?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}

// Type for the response data structure
interface ResponseData {
  HttpResponse?: {
    Message?: string;
    StatusCode?: number | boolean;
    Content?: unknown;
  };
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// Environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;

/**
 * Common API function that handles different authentication scenarios
 * 
 * @param endpoint - API endpoint (relative to base URL)
 * @param config - Configuration object for the API call
 * @returns Promise<ApiResponse>
 * 
 * Usage examples:
 * 
 * // Route that needs headers (like login/register)
 * const response = await apiCall('/identity/login', {
 *   method: 'POST',
 *   body: { email, password },
 *   requireHeaders: true
 * });
 * 
 * // Route that needs token but not headers
 * const response = await apiCall('/users/profile', {
 *   method: 'GET',
 *   token: userToken,
 *   requireAuth: true
 * });
 * 
 * // Route that needs neither
 * const response = await apiCall('/public/data', {
 *   method: 'GET'
 * });
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  config: ApiCallConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      method = 'GET',
      body,
      headers = {},
      token,
      requireAuth = false,
      requireHeaders = false,
      customHeaders = {}
    } = config;

    // Validate API URL
    if (!API_URL) {
      console.error('API_URL is not configured');
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: 'API URL is not configured. Please check your environment variables.'
      };
    }

    // Build the full URL
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
      ...customHeaders
    };

    // Add client credentials and security headers if headers are required
    if (requireHeaders) {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('Client credentials are not configured');
        return {
          data: null as T,
          status: 500,
          ok: false,
          error: 'Client credentials are not configured. Please check your environment variables.'
        };
      }
      requestHeaders.client_id = CLIENT_ID;
      requestHeaders.client_secret = CLIENT_SECRET;
      
      // Generate security headers on server side
      try {
        const crypto = await import('crypto');
        const nonce = Math.floor(Math.random() * 10000000).toString();
        const timestamp = Date.now().toString();
        const data = `${nonce}:${timestamp}`;
        
        // Generate signature using server-side secret
        const secret = process.env.SIGNATURE_SECRET || CLIENT_SECRET || '';
        const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
        
        requestHeaders['X-POP-Nonce'] = nonce;
        requestHeaders['X-POP-Timestamp'] = timestamp;
        requestHeaders['X-POP-Signature'] = signature;
      } catch (error) {
        console.warn('Failed to generate security headers:', error);
        // Continue without security headers if generation fails
      }
    }

    // Add authorization token if required
    if (requireAuth && token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body if present
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the API call
    const response = await fetch(fullUrl, requestOptions);
    
    // Handle 429 Too Many Requests error
    if (response.status === 429) {
      console.warn('Rate limit exceeded (429): Too many requests to the API');
    }
    
    // Handle response body reading safely
    let responseData: unknown = null;
    let responseText = '';
    
    try {
      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (contentLength === '0' || !contentType) {
        // Empty response
        responseData = {};
      } else if (contentType && contentType.includes('application/json')) {
        // Try to parse as JSON
        responseData = await response.json();
      } else {
        // Try to read as text first
        responseText = await response.text();
        if (responseText.trim()) {
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = { error: 'Invalid JSON response', rawText: responseText };
          }
        } else {
          responseData = {};
        }
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      responseData = { error: 'Failed to parse response from server' };
    }

    // Check both HTTP status and business logic status
    // Legacy APIs use StatusCode: true (boolean) instead of 200
    const isHttpOk = response.ok;
    const typedResponseData = responseData as ResponseData;
    const businessStatusCode = typedResponseData?.HttpResponse?.StatusCode;
    const isBusinessOk =
      businessStatusCode === 200 ||
      businessStatusCode === 201 ||
      businessStatusCode === true ||
      businessStatusCode === undefined;
    
    // Determine if the overall response is successful
    const isOverallOk = isHttpOk && isBusinessOk;

    return {
      data: responseData as T,
      status: response.status,
      ok: isOverallOk,
      error: !isOverallOk ? typedResponseData?.HttpResponse?.Message || typedResponseData?.message || typedResponseData?.error : undefined
    };

  } catch (error) {
    console.error('API call error:', error);
    console.error('API call details:', {
      endpoint,
      method: config.method || 'GET',
      headers: config.headers || {},
      body: config.body ? JSON.stringify(config.body).substring(0, 200) + '...' : 'none'
    });
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Network error or unexpected error occurred';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Invalid response from server. Please try again.';
    } else if (error instanceof Error) {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    return {
      data: null as T,
      status: 500,
      ok: false,
      error: errorMessage
    };
  }
}

/**
 * Convenience functions for common API patterns
 */

// For routes that need headers (login, register, etc.)
export async function apiCallWithHeaders<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method,
    body,
    requireHeaders: true
  });
}

// For routes that need authentication token
export async function apiCallWithAuth<T = unknown>(
  endpoint: string,
  token: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method,
    body,
    token,
    requireAuth: true
  });
}

// For public routes that need neither headers nor tokens
export async function apiCallPublic<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method,
    body
  });
}

// Refresh token API call
export async function refreshAuthToken(client_id: string, client_secret: string, refreshToken: string) {
  return apiCall('/identity/refresh', {
    method: 'POST',
    headers: {
      'X-Dynamic-URL': '/identity/refresh',
      'client_id': client_id,
      'client_secret': client_secret,
    },
    body: { RefreshToken: refreshToken },
    requireHeaders: true
  });
}

/**
 * Utility function to get client IP from NextRequest
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Helper function to handle API responses in route handlers
 */
export function createApiResponse<T = unknown>(
  data: T,
  status: number = 200,
  error?: string
): Response {
  const responseData = {
    data,
    status,
    ok: status >= 200 && status < 300,
    error
  };

  return new Response(JSON.stringify(responseData), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 









