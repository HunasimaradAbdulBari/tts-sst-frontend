// app/api/transcripts/route.js
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST - Save transcript
export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/transcripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorData}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json(
      { error: `API error: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET - Retrieve transcripts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    
    const url = new URL(`${BACKEND_URL}/api/transcripts`);
    if (language) {
      url.searchParams.set('language', language);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorData}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json(
      { error: `API error: ${error.message}` },
      { status: 500 }
    );
  }
}