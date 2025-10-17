import { NextResponse } from 'next/server';

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:5000';

export async function GET() {
  try {
    // Check Express backend health
    const response = await fetch(`${EXPRESS_API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          frontend: 'healthy',
          backend: 'unhealthy',
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'healthy',
      frontend: 'healthy',
      backend: data,
    });

  } catch (error) {
    console.error('Health Check Error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        frontend: 'healthy',
        backend: 'unreachable',
        error: error.message,
      },
      { status: 503 }
    );
  }
}