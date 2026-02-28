import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const user = getUser(session.email);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ user });
}
