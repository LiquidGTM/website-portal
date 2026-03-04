import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChangeRequest, updateChangeRequest } from '@/lib/db';
import { closePullRequest } from '@/lib/github';

type Params = Promise<{ id: string }>;

export async function POST(
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
    const { feedback } = await request.json();
    
    const changeRequest = await getChangeRequest(id);
    
    if (!changeRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    if (changeRequest.userEmail !== session.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    if (changeRequest.status !== 'staging') {
      return NextResponse.json(
        { error: 'Request must be in staging status to reject' },
        { status: 400 }
      );
    }
    
    if (changeRequest.prNumber) {
      const [owner, repo] = changeRequest.siteRepo.split('/');
      await closePullRequest(owner, repo, changeRequest.prNumber);
    }
    
    const updated = await updateChangeRequest(id, {
      status: 'rejected',
      feedback,
    });
    
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}
