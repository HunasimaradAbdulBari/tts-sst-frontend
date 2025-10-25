import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request) {
  console.log('🎙️ [Next.js STT] Request received');
  
  try {
    const formData = await request.formData();
    console.log('📁 [Next.js STT] FormData received');
    
    const response = await fetch(`${BACKEND_URL}/api/stt`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('📡 [Next.js STT] Backend status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [Next.js STT] Backend error:', errorData);
      return NextResponse.json(
        { error: `Backend error: ${errorData}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ [Next.js STT] Success:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ [Next.js STT] Error:', error);
    return NextResponse.json(
      { error: `STT API Route Error: ${error.message}` },
      { status: 500 }
    );
  }
}
