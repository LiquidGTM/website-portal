'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type User = {
  email: string;
  name?: string;
  clientSites: string[];
};

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [siteRepo, setSiteRepo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Pre-select site from query param
        const siteParam = searchParams.get('site');
        if (siteParam && data.user.clientSites.includes(siteParam)) {
          setSiteRepo(siteParam);
        } else if (data.user.clientSites.length > 0) {
          setSiteRepo(data.user.clientSites[0]);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        router.push('/');
      }
    }

    loadUser();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteRepo, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create request');
      } else {
        router.push(`/requests/${data.request.id}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Change Request</CardTitle>
            <CardDescription>
              Describe the changes you'd like to make to your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site">Website</Label>
                <select
                  id="site"
                  value={siteRepo}
                  onChange={(e) => setSiteRepo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={loading}
                >
                  {user.clientSites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., 'Update the hero headline to: [New Headline]' or 'Add a new team member: [Name, Role, Bio]'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-sm text-neutral-600">
                  Be as specific as possible. Include exact text, images, or details you want changed.
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-800 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Submit Request'}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewRequestForm />
    </Suspense>
  );
}
