import { NextResponse } from 'next/server';
import { LANGUAGES } from '../../lib/constants';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      languages: LANGUAGES,
      count: LANGUAGES.length,
    });
  } catch (error) {
    console.error('Languages API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}