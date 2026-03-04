// Simple in-memory database for MVP
// Replace with Vercel Postgres or Upstash Redis in production

export type User = {
  email: string;
  name?: string;
  clientSites: string[]; // GitHub repo names
};

export type ChangeRequestStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'staging' 
  | 'approved' 
  | 'rejected' 
  | 'deployed';

export type ChangeRequest = {
  id: string;
  userEmail: string;
  siteRepo: string;
  description: string;
  status: ChangeRequestStatus;
  stagingBranch?: string;
  previewUrl?: string;
  prNumber?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
};

// In-memory storage (replace with real DB)
const users: Map<string, User> = new Map();
const changeRequests: Map<string, ChangeRequest> = new Map();
const magicLinks: Map<string, { email: string; expiresAt: number }> = new Map();

// Initialize with test user
users.set('test@example.com', {
  email: 'test@example.com',
  name: 'Test User',
  clientSites: ['LiquidGTM/v0-data-shapes-ai-website'],
});

// Magic Link functions
export function createMagicLink(email: string, token: string) {
  magicLinks.set(token, {
    email,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
}

export function verifyMagicLink(token: string): string | null {
  const link = magicLinks.get(token);
  if (!link || link.expiresAt < Date.now()) {
    magicLinks.delete(token);
    return null;
  }
  magicLinks.delete(token);
  return link.email;
}

// User functions
export function getUser(email: string): User | null {
  return users.get(email) || null;
}

// Returns existing user or creates one (safe for serverless — no state dependency)
export function getOrCreateUser(email: string): User {
  const existing = users.get(email);
  if (existing) return existing;
  
  // Default sites for any authenticated user (MVP — replace with real DB)
  const user: User = {
    email,
    clientSites: ['LiquidGTM/v0-data-shapes-ai-website'],
  };
  users.set(email, user);
  return user;
}

export function createUser(email: string, clientSites: string[] = []): User {
  const user: User = {
    email,
    clientSites,
  };
  users.set(email, user);
  return user;
}

export function updateUser(email: string, updates: Partial<User>): User | null {
  const user = users.get(email);
  if (!user) return null;
  
  const updated = { ...user, ...updates };
  users.set(email, updated);
  return updated;
}

// Change Request functions
export function getChangeRequest(id: string): ChangeRequest | null {
  return changeRequests.get(id) || null;
}

export function getChangeRequestsByUser(email: string): ChangeRequest[] {
  return Array.from(changeRequests.values())
    .filter(req => req.userEmail === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getChangeRequestsBySite(siteRepo: string): ChangeRequest[] {
  return Array.from(changeRequests.values())
    .filter(req => req.siteRepo === siteRepo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createChangeRequest(
  userEmail: string,
  siteRepo: string,
  description: string
): ChangeRequest {
  const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const request: ChangeRequest = {
    id,
    userEmail,
    siteRepo,
    description,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  
  changeRequests.set(id, request);
  return request;
}

export function updateChangeRequest(
  id: string,
  updates: Partial<Omit<ChangeRequest, 'id' | 'createdAt'>>
): ChangeRequest | null {
  const request = changeRequests.get(id);
  if (!request) return null;
  
  const updated = {
    ...request,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  changeRequests.set(id, updated);
  return updated;
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function getAllChangeRequests(): ChangeRequest[] {
  return Array.from(changeRequests.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
