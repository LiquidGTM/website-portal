import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createChangeRequest, getChangeRequestsByUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const requests = getChangeRequestsByUser(session.email);
  
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  try {
    const { siteRepo, description } = await request.json();
    
    if (!siteRepo || !description) {
      return NextResponse.json(
        { error: 'siteRepo and description are required' },
        { status: 400 }
      );
    }
    
    const changeRequest = createChangeRequest(
      session.email,
      siteRepo,
      description
    );
    
    return NextResponse.json({ request: changeRequest }, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    );
  }
}
