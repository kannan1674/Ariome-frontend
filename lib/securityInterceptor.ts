/**
 * Generate security parameters (nonce, timestamp, signature) using RSA
 */
export async function generateSecurityParams(): Promise<{
  nonce: string;
  timestamp: string;
  signature: string;
}> {
  const nonce = Math.floor(Math.random() * 10000000).toString();
  const timestamp = Date.now().toString(); // Unix timestamp in milliseconds
  const data = `${nonce}:${timestamp}`;
  
  
  // Get private key from environment variable
  const privateKeyBase64 = process.env.PRIVATE_KEY || '';
  
  if (!privateKeyBase64) {
   
    
    // Fallback: use a simple hash instead of RSA signing
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(data);
    const signature = hash.digest('base64');
    
    return { nonce, timestamp, signature };
  }
  
  try {
        
    // Convert Base64 to PEM format
    const privateKeyBuffer = Buffer.from(privateKeyBase64, 'base64');
    const privateKeyString = privateKeyBuffer.toString('base64');
    const chunks = privateKeyString.match(/.{1,64}/g) || [privateKeyString];
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
           
    // Create RSA signature
    const crypto = await import('crypto');
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(privateKeyPem, 'base64');
      
    
    return { nonce, timestamp, signature };
  } catch {
    
    
    // Fallback to hash method
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(data);
    const signature = hash.digest('base64');
  
   
    
    return { nonce, timestamp, signature };
  }
}

/**
 * Create security headers for API calls
 */
export async function createSecurityHeaders(): Promise<Record<string, string>> {
  const { nonce, timestamp, signature } = await generateSecurityParams();
  
  // Log security parameters for debugging
  console.log('🔐 [SecurityInterceptor] Generated security params:', {
    nonce,
    timestamp,
    signature: signature.substring(0, 20) + '...', // Log partial signature for security
    currentTime: new Date().toISOString(),
    timestampAge: Date.now() - parseInt(timestamp)
  });
  
  const headers = {
    'X-POP-Nonce': nonce,
    'X-POP-Timestamp': timestamp,
    'X-POP-Signature': signature,
  };
  

  
  return headers;
}

/**
 * Secure API call wrapper that automatically adds security headers
 */
export async function secureApiCall<T = unknown>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<{
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}> {
  try {
    // Generate security headers
    const securityHeaders = await createSecurityHeaders();
    
    // Log the complete request headers being sent
    console.log('🔐 [SecurityInterceptor] Request headers:', {
      url,
      method: options.method || 'GET',
      securityHeaders: {
        'X-POP-Nonce': securityHeaders['X-POP-Nonce'],
        'X-POP-Timestamp': securityHeaders['X-POP-Timestamp'],
        'X-POP-Signature': securityHeaders['X-POP-Signature'],
        'X-POP-Signature-Preview': securityHeaders['X-POP-Signature'].substring(0, 20) + '...'
      },
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'N/A'
    });
    
    // Prepare headers - Content-Type must be first for ASP.NET compatibility
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...securityHeaders,
      ...(options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)
        ? options.headers as Record<string, string>
        : {}),
    };

    // Add authorization token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log final headers being sent (for debugging 415 errors)
    console.log('🔐 [SecurityInterceptor] Final request headers:', {
      'Content-Type': headers['Content-Type'],
      'X-POP-Nonce': headers['X-POP-Nonce'] ? 'present' : 'missing',
      'X-POP-Timestamp': headers['X-POP-Timestamp'] ? 'present' : 'missing',
      'X-POP-Signature': headers['X-POP-Signature'] ? 'present' : 'missing',
      'Authorization': headers['Authorization'] ? 'present' : 'missing',
      'hasCustomHeaders': Object.keys(options.headers || {}).length > 0,
      'allHeaders': Object.keys(headers)
    });

    // Make the API call - don't modify the body, pass it through as is
    // Don't spread options here as it might override headers
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body, // Pass the body through without modification
      signal: options.signal, // Include signal if present
    });

    // Log response details for debugging
    console.log('🔐 [SecurityInterceptor] Response received:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      contentLength: response.headers.get('content-length'),
      contentType: response.headers.get('content-type')
    });

    // Handle 429 Too Many Requests error
    if (response.status === 429) {
      console.warn('Rate limit exceeded (429): Too many requests to the API');
    }

    // Handle 401 Unauthorized - Session expired
    if (response.status === 401) {
      console.log('🔐 [SecurityInterceptor] 401 Unauthorized detected');
      // Note: Session expiry handling will be done by the client API layer
    }

   

    // Handle response body reading safely
    let data: unknown = null;
    let responseText = '';
    
    // Clone the response to avoid "Body has already been read" error
    const responseClone = response.clone();
    
    try {
      // Try to read as JSON first
      data = await response.json();
      console.log('🔐 [SecurityInterceptor] Successfully parsed JSON response:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
      });
   
    } catch (jsonError) {
      console.error('🔐 [SecurityInterceptor] Failed to parse response as JSON:', jsonError);
      
      try {
        // If JSON fails, try to read as text from the cloned response
        responseText = await responseClone.text();
        
        // Check if response is empty
        if (!responseText || responseText.trim() === '') {
          console.log('🔐 [SecurityInterceptor] Empty response body detected:', {
            responseText,
            responseTextLength: responseText?.length || 0,
            responseOk: response.ok,
            responseStatus: response.status
          });
          
          // Check if this is a successful status code but empty body
          if (response.ok && response.status >= 200 && response.status < 300) {
            data = { 
              HttpResponse: { 
                StatusCode: response.status, 
                Message: 'Request processed successfully but no data returned' 
              } 
            };
            console.log('🔐 [SecurityInterceptor] Created success response for empty body');
          } else {
            data = { error: 'Empty response from server' };
            console.log('🔐 [SecurityInterceptor] Created error response for empty body');
          }
        }
        // Try to parse the text as JSON if it looks like JSON
        else if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            data = JSON.parse(responseText);
         
          } catch (parseError) {
            console.error('Failed to parse text as JSON:', parseError);
            data = { error: 'Invalid JSON response from server', rawText: responseText };
          }
        } else {
          // Log the actual response for debugging
          data = { error: 'Non-JSON response from server', rawText: responseText, status: response.status };
        }
      } catch (textError) {
        console.error('Failed to read response as text:', textError);
        data = { error: 'Unable to read response from server', status: response.status };
      }
    }

    if (!response.ok) {
      console.error('API call failed with status:', response.status);
      console.error('Error data:', data);
      
      // Try to extract meaningful error message
      let errorMessage = 'Request failed';
      const errorData = data as { error?: string; message?: string; HttpResponse?: { Message?: string } };
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData && errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData && errorData.HttpResponse && errorData.HttpResponse.Message) {
        errorMessage = errorData.HttpResponse.Message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else if (responseText) {
        errorMessage = responseText;
      } else if (response.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'Profile update service not found. Please contact support.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request data. Please check your input and try again.';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests. Please try again in a minute.';
      } else {
        errorMessage = `Server error (${response.status}). Please try again later.`;
      }

      return {
        data: data as T,
        status: response.status,
        ok: false,
        error: errorMessage
      };
    }

    return {
      data: data as T,
      status: response.status,
      ok: true,
      error: undefined
    };
  } catch (error) {
    console.error('Secure API call error:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Network error or unexpected error occurred';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
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
 * Client-side secure API call for Next.js API routes
 */
export async function secureClientApiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<{
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}> {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  return secureApiCall(fullUrl, options, token);
}

/**
 * Server-side secure API call for external APIs
 */
export async function secureServerApiCall<T = unknown>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<{
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}> {
  return secureApiCall(url, options, token);
} 