import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, setSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }
  
  const email = await verifyMagicToken(token);
  
  if (!email) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
  
  // Set session
  await setSession(email);
  
  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
