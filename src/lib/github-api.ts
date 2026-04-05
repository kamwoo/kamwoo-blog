const token = process.env.GITHUB_TOKEN!;
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH ?? 'main';

async function apiFetch(filePath: string, init?: RequestInit) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

async function getFileSHA(filePath: string): Promise<string | null> {
  const res = await apiFetch(filePath);
  if (!res.ok) return null;
  const data = (await res.json()) as { sha: string };
  return data.sha ?? null;
}

export async function upsertFile(
  filePath: string,
  content: Buffer | string,
  message: string,
) {
  const sha = await getFileSHA(filePath);
  const b64 = Buffer.isBuffer(content)
    ? content.toString('base64')
    : Buffer.from(content, 'utf-8').toString('base64');

  const body = JSON.stringify({ message, content: b64, branch, ...(sha ? { sha } : {}) });
  const res = await apiFetch(filePath, { method: 'PUT', body });
  if (!res.ok) throw new Error(`GitHub upsertFile failed (${res.status}): ${await res.text()}`);
}

export async function deleteFile(filePath: string, message: string) {
  const sha = await getFileSHA(filePath);
  if (!sha) return;
  const res = await apiFetch(filePath, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`GitHub deleteFile failed (${res.status}): ${await res.text()}`);
  }
}

async function listDir(dirPath: string): Promise<Array<{ path: string; type: string }>> {
  const res = await apiFetch(dirPath);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? (data as Array<{ path: string; type: string }>) : [];
}

export async function deleteDir(dirPath: string, message: string) {
  const items = await listDir(dirPath);
  await Promise.all(
    items.map((item) =>
      item.type === 'dir'
        ? deleteDir(item.path, message)
        : deleteFile(item.path, message),
    ),
  );
}
