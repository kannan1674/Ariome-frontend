import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    // Return available authentication providers
    const providers = {
      credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' }
        }
      }
    };
    
  
    
    return NextResponse.json(providers, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Providers endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to get authentication providers' },
      { status: 500 }
    );
  }
}
