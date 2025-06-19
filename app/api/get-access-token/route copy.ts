import { NextResponse } from 'next/server';
import { HeygenSDK } from '@teamduality/heygen-typescript-sdk';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    console.log('Environment check:', { 
      HEYGEN_KEY_EXISTS: !!HEYGEN_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME
    });
    
    if (!HEYGEN_API_KEY) {
      console.error('HEYGEN_API_KEY is missing from environment variables');
      return NextResponse.json({
        success: false,
        error: 'API key is missing from environment',
      }, { status: 500 });
    }

    // Initialize the HeyGen SDK with the API key
    const sdk = new HeygenSDK(HEYGEN_API_KEY);
    
    // Use the SDK to create a session token
    console.log('Calling HeyGen SDK createSessionToken...');
    const data = await sdk.streaming.createSessionToken();
    
    // Log the full response structure for debugging
    console.log('HeyGen SDK response:', JSON.stringify(data, null, 2));
    
    // Extract token from the response
    const token = data?.token;
    
    if (!token) {
      console.error('Could not find token in HeyGen SDK response:', data);
      return NextResponse.json({
        success: false,
        error: 'Could not extract token from HeyGen SDK response',
        response: data
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      token: token
    }, { status: 200 });
  } catch (error) {
    console.error('Error in get-access-token:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve access token',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
