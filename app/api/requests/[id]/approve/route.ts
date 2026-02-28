import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChangeRequest, updateChangeRequest } from '@/lib/db';
import { mergePullRequest } from '@/lib/github';

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
    
    // Must be in staging status
    if (changeRequest.status !== 'staging') {
      return NextResponse.json(
        { error: 'Request must be in staging status to approve' },
        { status: 400 }
      );
    }
    
    // Merge PR if exists
    if (changeRequest.prNumber) {
      const [owner, repo] = changeRequest.siteRepo.split('/');
      await mergePullRequest(owner, repo, changeRequest.prNumber);
    }
    
    // Update status to approved (will be deployed automatically by Vercel)
    const updated = updateChangeRequest(id, {
      status: 'deployed',
    });
    
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Approve request error:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}
