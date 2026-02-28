# Testing Guide - Website Portal MVP

## Quick Test Flow

### 1. Login Test

1. Visit https://website-portal-gilt.vercel.app
2. Enter your email address
3. Check your email for the magic link
4. Click the link (valid for 15 minutes)
5. Should redirect to `/dashboard`

**Test User (pre-configured):** test@example.com

### 2. Dashboard Test

On the dashboard, you should see:
- Your email in the header
- A "Logout" button
- Your client sites (for test@example.com: `v0-data-shapes-ai-website`)
- Recent change requests (empty initially)
- "New Request" button

### 3. Create Change Request

1. Click "Request Change" on a site card (or "New Request")
2. Select the website (should be pre-selected)
3. Enter a detailed description, e.g.:
   ```
   Update the hero headline to: "Welcome to Data Shapes AI"
   
   Also update the subtitle to: "Transform your data with AI-powered insights"
   ```
4. Click "Submit Request"
5. Should redirect to the request detail page
6. Status should be "PENDING"

### 4. Manual Code Change Process (MVP)

Since AI code generation isn't implemented yet, you need to manually:

1. Create a staging branch for the request
2. Make the code changes
3. Push to the staging branch
4. Vercel will auto-deploy a preview
5. Update the request status to 'staging' with the preview URL

**Example using the API:**

```bash
# Get the request ID from the URL (e.g., req_1234567890_abc123)
REQUEST_ID="req_1234567890_abc123"

# Update the request
curl -X PATCH "https://website-portal-gilt.vercel.app/api/requests/$REQUEST_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN_FROM_BROWSER" \
  -d '{
    "status": "staging",
    "stagingBranch": "staging/1234567890",
    "previewUrl": "https://v0-data-shapes-ai-website-staging.vercel.app",
    "prNumber": 123
  }'
```

Or directly in the code:

```typescript
// In lib/db.ts or via API
updateChangeRequest('req_1234567890_abc123', {
  status: 'staging',
  stagingBranch: 'staging/1234567890',
  previewUrl: 'https://v0-data-shapes-ai-website-git-staging-1234567890.vercel.app',
  prNumber: 123
});
```

### 5. Review & Approve Test

1. Go back to the request detail page
2. Status should now be "STAGING"
3. Click "Open Preview" to see the staging site
4. Review the changes
5. Click "Approve & Deploy" to merge to production
6. Or enter feedback and click "Reject Changes" to decline

### 6. Approval Flow

When approved:
- The PR will be merged to main
- Vercel will auto-deploy to production
- Request status changes to "DEPLOYED"
- Success message shows on the page

### 7. Rejection Flow

When rejected:
- The PR will be closed
- Request status changes to "REJECTED"
- Feedback is stored and visible

---

## API Testing with cURL

### Get Current User

```bash
curl -X GET "https://website-portal-gilt.vercel.app/api/auth/me" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Create Request

```bash
curl -X POST "https://website-portal-gilt.vercel.app/api/requests" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "siteRepo": "LiquidGTM/v0-data-shapes-ai-website",
    "description": "Update hero headline to: Welcome!"
  }'
```

### List Requests

```bash
curl -X GET "https://website-portal-gilt.vercel.app/api/requests" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Get Request Details

```bash
curl -X GET "https://website-portal-gilt.vercel.app/api/requests/req_123" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Approve Request

```bash
curl -X POST "https://website-portal-gilt.vercel.app/api/requests/req_123/approve" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Reject Request

```bash
curl -X POST "https://website-portal-gilt.vercel.app/api/requests/req_123/reject" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{"feedback": "Please revise the headline"}'
```

---

## Known Limitations (MVP)

- **In-Memory Database:** All data is lost when the server restarts
- **No AI Generation:** Code changes must be made manually
- **Single Test User:** Only test@example.com is pre-configured
- **No Notifications:** Only magic link emails are sent
- **Manual Status Updates:** Admin must update request status to 'staging' manually
- **No Admin Panel:** Can't add new users or sites via UI

---

## Troubleshooting

### Magic Link Not Working

- Check spam folder
- Link expires after 15 minutes
- Only works once (consumed on first use)

### Can't See My Site

- Only `test@example.com` has `v0-data-shapes-ai-website` configured
- To add a site, modify `lib/db.ts` or wait for admin panel

### Request Stuck in Pending

- Status must be manually updated to 'staging' after code changes
- Use the API or modify in-memory database

### Preview URL Not Showing

- Preview URL must be set when updating to 'staging' status
- Vercel must have deployed the staging branch

### Approve Button Not Working

- Request must be in 'staging' status
- PR number must be set
- GitHub token must have merge permissions

---

## Next: Add Real Database

To replace in-memory storage with Vercel Postgres:

1. Install `@vercel/postgres`
2. Create tables for users and change_requests
3. Replace Map operations with SQL queries
4. Keep the same interface for easy migration

```sql
CREATE TABLE users (
  email TEXT PRIMARY KEY,
  name TEXT,
  client_sites TEXT[]
);

CREATE TABLE change_requests (
  id TEXT PRIMARY KEY,
  user_email TEXT REFERENCES users(email),
  site_repo TEXT,
  description TEXT,
  status TEXT,
  staging_branch TEXT,
  preview_url TEXT,
  pr_number INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
