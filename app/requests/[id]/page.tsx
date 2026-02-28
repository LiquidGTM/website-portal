'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ChangeRequest = {
  id: string;
  userEmail: string;
  siteRepo: string;
  description: string;
  status: string;
  stagingBranch?: string;
  previewUrl?: string;
  prNumber?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  staging: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  deployed: 'bg-green-600',
};

const statusDescriptions: Record<string, string> = {
  pending: 'Your request is waiting to be processed',
  in_progress: 'Changes are being made to your website',
  staging: 'Changes are ready for review on staging',
  approved: 'Changes have been approved',
  rejected: 'Changes were rejected',
  deployed: 'Changes are live on your website',
};

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load request');
      }
      const data = await res.json();
      setRequest(data.request);
    } catch (err) {
      setError('Failed to load request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id, router]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve these changes? They will go live on your website.')) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve');
      }

      await loadRequest();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback for rejection');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject');
      }

      await loadRequest();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Request not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Change Request</CardTitle>
                <Badge className={statusColors[request.status]}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">Website</h3>
                <p className="text-neutral-900">{request.siteRepo}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">Description</h3>
                <p className="text-neutral-900 whitespace-pre-wrap">{request.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">Status</h3>
                <p className="text-neutral-700">{statusDescriptions[request.status]}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Created:</span>{' '}
                  <span className="text-neutral-900">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Updated:</span>{' '}
                  <span className="text-neutral-900">
                    {new Date(request.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {request.feedback && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Feedback</h3>
                  <p className="text-neutral-900 whitespace-pre-wrap">{request.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {request.status === 'staging' && request.previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-neutral-700">
                    Your changes are ready to review. Check the preview and approve or reject.
                  </p>
                  <a
                    href={request.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="outline">Open Preview →</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {request.status === 'staging' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm bg-red-50 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? 'Processing...' : 'Approve & Deploy'}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Label htmlFor="feedback" className="mb-2 block">
                    Or reject with feedback:
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder="Explain what needs to be changed..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={actionLoading}
                    rows={4}
                    className="mb-4"
                  />
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    {actionLoading ? 'Processing...' : 'Reject Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {request.status === 'deployed' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <div className="text-green-600 text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-green-900">Changes Deployed!</h3>
                    <p className="text-sm text-green-700">
                      Your changes are now live on your website.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
