'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type User = {
  email: string;
  name?: string;
  clientSites: string[];
};

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/');
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        // Load requests
        const requestsRes = await fetch('/api/requests');
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData.requests);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Website Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Sites</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.clientSites.map((site) => (
              <Card key={site}>
                <CardHeader>
                  <CardTitle className="text-lg">{site.split('/')[1]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">{site}</p>
                  <Link href={`/requests/new?site=${encodeURIComponent(site)}`}>
                    <Button className="w-full">Request Change</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Change Requests</h2>
            <Link href="/requests/new">
              <Button>New Request</Button>
            </Link>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-neutral-600">
                No change requests yet. Create your first one!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Link key={request.id} href={`/requests/${request.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusColors[request.status]}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-neutral-600">
                              {request.siteRepo.split('/')[1]}
                            </span>
                          </div>
                          <p className="text-neutral-800 mb-2">
                            {request.description.length > 100
                              ? `${request.description.substring(0, 100)}...`
                              : request.description}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
