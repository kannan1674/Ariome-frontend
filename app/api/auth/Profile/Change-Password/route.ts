import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { secureServerApiCall } from '@/lib/securityInterceptor';

export async function PUT(req: NextRequest) {
  try {

    
    // Clone the request to avoid "Body has already been read" error
    const clonedReq = req.clone();
    
    // Get token from secure cookie
    const token = (await cookies()).get('authToken')?.value;
    
    

    if (!token) {

      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get request body from the cloned request
    const body = await clonedReq.json();

    
    // Call the backend API using the security interceptor
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await secureServerApiCall(
      `${backendUrl}/profile/change-password`,
      { 
        method: 'PUT',
        body: JSON.stringify(body)
      },
      token
    );


    if (!response.ok) {
 
      return NextResponse.json(
        { error: response.error || 'Failed to change password' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while changing password' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // GET method not supported for change password endpoint
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST() {
  // POST method not supported for change password endpoint
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 