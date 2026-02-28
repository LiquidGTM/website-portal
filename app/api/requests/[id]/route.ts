import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChangeRequest, updateChangeRequest } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  const changeRequest = getChangeRequest(id);
  
  if (!changeRequest) {
    return NextResponse.json(
      { error: 'Request not found' },
      { status: 404 }
    );
  }
  
  // Ensure user owns this request
  if (changeRequest.userEmail !== session.email) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({ request: changeRequest });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getSession();
  
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const changeRequest = getChangeRequest(id);
    
    if (!changeRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this request
    if (changeRequest.userEmail !== session.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const updated = updateChangeRequest(id, updates);
    
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
