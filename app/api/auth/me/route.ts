import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  // Always returns a user — creates one from JWT email if not in memory
  const user = getOrCreateUser(session.email);
  
  return NextResponse.json({ user });
}
