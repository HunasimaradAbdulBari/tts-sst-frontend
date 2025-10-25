import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  console.log('🏥 [Next.js Health] Request received');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Backend health check failed',
        frontend: 'healthy',
        backend: 'unhealthy'
      }, { status: 500 });
    }
    
    const data = await response.json();
    return NextResponse.json({
      ...data,
      frontend: 'healthy'
    });
    
  } catch (error) {
    console.error('❌ [Next.js Health] Error:', error);
    return NextResponse.json({
      error: `Health check failed: ${error.message}`,
      frontend: 'healthy',
      backend: 'unreachable'
    }, { status: 500 });
  }
}
