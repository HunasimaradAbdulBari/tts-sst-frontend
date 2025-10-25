import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request) {
  console.log('🔊 [Next.js TTS] Request received');
  
  try {
    const body = await request.json();
    console.log('📝 [Next.js TTS] Body:', body);
    
    const response = await fetch(`${BACKEND_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 [Next.js TTS] Backend status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [Next.js TTS] Backend error:', errorData);
      return NextResponse.json(
        { error: `Backend error: ${errorData}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ [Next.js TTS] Success:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ [Next.js TTS] Error:', error);
    return NextResponse.json(
      { error: `TTS API Route Error: ${error.message}` },
      { status: 500 }
    );
  }
}
