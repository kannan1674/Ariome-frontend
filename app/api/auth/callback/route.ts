import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code'); // Strava OAuth code
    const error = searchParams.get('error'); // Strava OAuth error
    // Get callbackUrl from state parameter (Strava returns it) or fallback to query param for backward compatibility
    const state = searchParams.get('state');
    const callbackUrl = state ? decodeURIComponent(state) : (searchParams.get('callbackUrl') || '/Home');
    
    // Handle Strava OAuth callback
    if (code) {
      // Redirect to client-side callback page with code to exchange for tokens
      const redirectUrl = new URL('/strava-callback', req.url);
      redirectUrl.searchParams.set('code', code);
      redirectUrl.searchParams.set('callbackUrl', callbackUrl);
      
      return NextResponse.redirect(redirectUrl.toString(), {
        status: 302,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    // Handle Strava OAuth error
    if (error) {
      const redirectUrl = new URL('/strava-callback', req.url);
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('callbackUrl', callbackUrl);
      
      return NextResponse.redirect(redirectUrl.toString(), {
        status: 302,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    // Fallback: Redirect to the callback URL
    return NextResponse.redirect(new URL(callbackUrl, req.url), {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Callback endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const _body = await req.json(); // Unused - commented out
    return NextResponse.json({ 
      success: true,
      message: 'Callback processed successfully'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Callback POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
