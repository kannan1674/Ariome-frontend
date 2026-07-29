import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate security headers (nonce, timestamp, signature)
 */
async function generateSecurityHeaders() {
  const crypto = await import('crypto');
  const nonce = Math.floor(Math.random() * 10000000).toString();
  const timestamp = Date.now().toString();
  const data = `${nonce}:${timestamp}`;
  
  // Generate signature using server-side secret
  const secret = process.env.SIGNATURE_SECRET || process.env.NEXT_PUBLIC_CLIENT_SECRET || '';
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  
  return {
    nonce,
    timestamp,
    signature
  };
}

export async function GET(req: NextRequest) {
  try {
    // Get client credentials
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET || '';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

    if (!backendUrl || !clientId || !clientSecret) {
      console.error('Missing backend or client credentials');
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables' },
        { status: 500 }
      );
    }

    // Get countryId from query parameters
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId');

    if (!countryId) {
      return NextResponse.json(
        { error: 'countryId parameter is required' },
        { status: 400 }
      );
    }

    // Generate security headers
    const { nonce, timestamp, signature } = await generateSecurityHeaders();

    // Prepare the request with only required parameters
    const requestData = {
      client_id: clientId,
      client_secret: clientSecret,
      nonce: nonce,
      timestamp: timestamp,
      signature: signature
    };

  

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Try sending parameters as headers instead of query params
      const fullUrl = `${backendUrl}/public/states?countryId=${encodeURIComponent(countryId)}`;


      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'client_id': requestData.client_id,
          'client_secret': requestData.client_secret,
          'nonce': requestData.nonce,
          'timestamp': requestData.timestamp,
          'signature': requestData.signature,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    
      
      let responseData;
      let responseText = '';
      try {
        responseText = await response.text();
        
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = { error: 'Empty response from server' };
        }
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        responseData = { 
          error: 'Invalid response format from server',
          rawResponse: responseText || 'No response text available'
        };
      }

      // Prepare response
      const res = NextResponse.json(responseData, {
        status: response.status,
      });

      // Set cache control headers
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');

      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('State API error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request timeout - backend took too long to respond');
          return NextResponse.json(
            { error: 'Request timeout - please try again' },
            { status: 408 }
          );
        } else if (error.message.includes('fetch')) {
          console.error('Network error - backend may be down');
          return NextResponse.json(
            { error: 'Unable to connect to server - please check your connection' },
            { status: 503 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Outer catch - unexpected error:', error);
    return NextResponse.json(
      { error: 'Server error occurred' },
      { status: 500 }
    );
  }
}