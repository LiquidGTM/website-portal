const VERCEL_API_BASE = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_API_KEY;
const VERCEL_TEAM_ID = 'team_IFmovFCFhvo66FF3ElmCKAqA';

async function vercelFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${VERCEL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

export async function getProjectDeployments(projectName: string) {
  return vercelFetch(
    `/v6/deployments?teamId=${VERCEL_TEAM_ID}&projectId=${projectName}&limit=20`
  );
}

export async function getDeploymentByBranch(projectName: string, branch: string) {
  const deployments = await getProjectDeployments(projectName);
  
  // Find deployment for this branch
  const deployment = deployments.deployments?.find(
    (d: any) => d.meta?.githubCommitRef === branch
  );
  
  return deployment;
}

export async function getPreviewUrl(projectName: string, branch: string): Promise<string | null> {
  const deployment = await getDeploymentByBranch(projectName, branch);
  
  if (deployment && deployment.url) {
    return `https://${deployment.url}`;
  }
  
  return null;
}

export async function listProjects() {
  return vercelFetch(`/v9/projects?teamId=${VERCEL_TEAM_ID}`);
}

export async function getProject(projectName: string) {
  return vercelFetch(`/v9/projects/${projectName}?teamId=${VERCEL_TEAM_ID}`);
}
