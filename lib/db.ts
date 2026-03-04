import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

// Default sites assigned to new users (MVP — later make this configurable)
const DEFAULT_CLIENT_SITES = ['LiquidGTM/v0-data-shapes-ai-website'];

// Types
export type User = {
  email: string;
  name?: string;
  clientSites: string[];
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

// ── User functions ──

function rowToUser(row: Record<string, unknown>): User {
  return {
    email: row.email as string,
    name: (row.name as string) || undefined,
    clientSites: (row.client_sites as string[]) || [],
  };
}

export async function getUser(email: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function getOrCreateUser(email: string): Promise<User> {
  const existing = await getUser(email);
  if (existing) return existing;
  return await createUser(email, DEFAULT_CLIENT_SITES);
}

export async function createUser(email: string, clientSites: string[] = DEFAULT_CLIENT_SITES): Promise<User> {
  const rows = await sql`
    INSERT INTO users (email, client_sites)
    VALUES (${email}, ${clientSites})
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING *
  `;
  return rowToUser(rows[0]);
}

export async function updateUser(email: string, updates: Partial<User>): Promise<User | null> {
  const existing = await getUser(email);
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const clientSites = updates.clientSites !== undefined ? updates.clientSites : existing.clientSites;

  const rows = await sql`
    UPDATE users
    SET name = ${name ?? null}, client_sites = ${clientSites}, updated_at = NOW()
    WHERE email = ${email}
    RETURNING *
  `;
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await sql`SELECT * FROM users ORDER BY created_at`;
  return rows.map(rowToUser);
}

// ── Change Request functions ──

function rowToChangeRequest(row: Record<string, unknown>): ChangeRequest {
  return {
    id: row.id as string,
    userEmail: row.user_email as string,
    siteRepo: row.site_repo as string,
    description: row.description as string,
    status: row.status as ChangeRequestStatus,
    stagingBranch: (row.staging_branch as string) || undefined,
    previewUrl: (row.preview_url as string) || undefined,
    prNumber: (row.pr_number as number) || undefined,
    feedback: (row.feedback as string) || undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export async function getChangeRequest(id: string): Promise<ChangeRequest | null> {
  const rows = await sql`SELECT * FROM change_requests WHERE id = ${id}`;
  return rows.length > 0 ? rowToChangeRequest(rows[0]) : null;
}

export async function getChangeRequestsByUser(email: string): Promise<ChangeRequest[]> {
  const rows = await sql`
    SELECT * FROM change_requests WHERE user_email = ${email} ORDER BY created_at DESC
  `;
  return rows.map(rowToChangeRequest);
}

export async function getChangeRequestsBySite(siteRepo: string): Promise<ChangeRequest[]> {
  const rows = await sql`
    SELECT * FROM change_requests WHERE site_repo = ${siteRepo} ORDER BY created_at DESC
  `;
  return rows.map(rowToChangeRequest);
}

export async function createChangeRequest(
  userEmail: string,
  siteRepo: string,
  description: string
): Promise<ChangeRequest> {
  const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const rows = await sql`
    INSERT INTO change_requests (id, user_email, site_repo, description)
    VALUES (${id}, ${userEmail}, ${siteRepo}, ${description})
    RETURNING *
  `;
  return rowToChangeRequest(rows[0]);
}

export async function updateChangeRequest(
  id: string,
  updates: Partial<Omit<ChangeRequest, 'id' | 'createdAt'>>
): Promise<ChangeRequest | null> {
  const existing = await getChangeRequest(id);
  if (!existing) return null;

  const status = updates.status ?? existing.status;
  const stagingBranch = updates.stagingBranch !== undefined ? updates.stagingBranch : existing.stagingBranch;
  const previewUrl = updates.previewUrl !== undefined ? updates.previewUrl : existing.previewUrl;
  const prNumber = updates.prNumber !== undefined ? updates.prNumber : existing.prNumber;
  const feedback = updates.feedback !== undefined ? updates.feedback : existing.feedback;

  const rows = await sql`
    UPDATE change_requests
    SET status = ${status},
        staging_branch = ${stagingBranch ?? null},
        preview_url = ${previewUrl ?? null},
        pr_number = ${prNumber ?? null},
        feedback = ${feedback ?? null},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length > 0 ? rowToChangeRequest(rows[0]) : null;
}

export async function getAllChangeRequests(): Promise<ChangeRequest[]> {
  const rows = await sql`SELECT * FROM change_requests ORDER BY created_at DESC`;
  return rows.map(rowToChangeRequest);
}
