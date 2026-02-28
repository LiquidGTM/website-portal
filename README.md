# Website Portal MVP

A self-service website management portal where clients can request changes to their websites. AI processes the requests, pushes to a staging branch, client previews and approves, then it goes to production.

## Features

- **Magic Link Authentication** - Passwordless login via email
- **Client Dashboard** - View your websites and change requests
- **Change Request System** - Submit detailed change requests
- **Status Tracking** - Follow requests from pending → staging → deployed
- **Preview & Approval** - Review staging previews before going live
- **GitHub Integration** - Automatic branch and PR management
- **Vercel Integration** - Preview deployment links

## Architecture

- **Framework:** Next.js 15 (App Router)
- **Auth:** Magic link email via Resend (JWT tokens in cookies)
- **Hosting:** Vercel
- **Database:** In-memory (MVP) - Replace with Vercel Postgres/Upstash Redis for production
- **APIs:** GitHub (Octokit), Vercel API

## Setup

### Prerequisites

- Node.js 18+
- GitHub account with repo access
- Vercel account
- Resend account for sending emails

### Environment Variables

Create a `.env.local` file:

```env
GITHUB_TOKEN=your_github_token
VERCEL_API_KEY=your_vercel_token
RESEND_API_KEY=your_resend_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Deploy to Vercel

```bash
npx vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deployments.

## Usage

### For Clients

1. Visit the portal and enter your email
2. Click the magic link sent to your email
3. View your websites on the dashboard
4. Click "Request Change" on a website
5. Describe the changes you want in detail
6. Wait for the changes to be staged
7. Review the preview deployment
8. Approve or reject with feedback

### For Admins (Phase 2)

- AI-powered code generation (not yet implemented)
- Manual code changes pushed to staging branches
- Staging branch auto-deploys to Vercel preview
- Client approval triggers merge to main → production

## API Routes

- `POST /api/auth/login` - Send magic link
- `GET /api/auth/verify` - Verify magic link and create session
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user
- `GET /api/requests` - List user's requests
- `POST /api/requests` - Create new request
- `GET /api/requests/[id]` - Get request details
- `PATCH /api/requests/[id]` - Update request
- `POST /api/requests/[id]/approve` - Approve and merge to production
- `POST /api/requests/[id]/reject` - Reject with feedback

## Database Schema

### User

```typescript
{
  email: string;
  name?: string;
  clientSites: string[]; // GitHub repo names
}
```

### ChangeRequest

```typescript
{
  id: string;
  userEmail: string;
  siteRepo: string;
  description: string;
  status: 'pending' | 'in_progress' | 'staging' | 'approved' | 'rejected' | 'deployed';
  stagingBranch?: string;
  previewUrl?: string;
  prNumber?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Roadmap

### Phase 1 (MVP) ✅
- Magic link authentication
- Dashboard and request management
- GitHub/Vercel integration
- Manual code changes

### Phase 2 (Next)
- AI-powered code generation
- Automated staging deployments
- Real database (Postgres/Redis)
- Multi-tenant admin panel
- Billing integration

## License

MIT
