import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    
    
    // Check environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
    

    if (!apiUrl || !clientId || !clientSecret) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Clone the request to avoid "Body has already been read" error
    const clonedReq = req.clone();
    
    const body = await clonedReq.json();
  
   
    // Validate required fields
    if (body.rForgotPasswordId === undefined || body.rForgotPasswordId === null || !body.ForgotPasswordId) {
      return NextResponse.json(
        { error: 'rForgotPasswordId and ForgotPasswordId are required' },
        { status: 400 }
      );
    }
    
    const requestData = {
      ForgotPasswordId: body.ForgotPasswordId,
      rForgotPasswordId: body.rForgotPasswordId
    };
   
       
    const response = await apiCallWithHeaders('/identity/forgot-password-resend-code', requestData);
  
  
    
    // Check if the response indicates an error
    if (!response.ok) {
      return NextResponse.json(
        response.data || { error: response.error },
        { status: response.status || 400 }
      );
    }
    

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Forgot password resend error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}