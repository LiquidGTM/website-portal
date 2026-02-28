import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function createStagingBranch(
  owner: string,
  repo: string,
  baseBranch: string = 'main'
): Promise<string> {
  const branchName = `staging/${Date.now()}`;
  
  // Get the SHA of the base branch
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });
  
  // Create new branch
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  });
  
  return branchName;
}

export async function createPullRequest(
  owner: string,
  repo: string,
  head: string,
  base: string = 'main',
  title: string,
  body: string
): Promise<number> {
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    head,
    base,
    title,
    body,
  });
  
  return pr.number;
}

export async function mergePullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<void> {
  await octokit.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    merge_method: 'squash',
  });
}

export async function closePullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<void> {
  await octokit.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    state: 'closed',
  });
}

export async function getRepository(owner: string, repo: string) {
  const { data } = await octokit.repos.get({
    owner,
    repo,
  });
  return data;
}

export async function listRepositoryDeployments(owner: string, repo: string) {
  const { data } = await octokit.repos.listDeployments({
    owner,
    repo,
  });
  return data;
}
