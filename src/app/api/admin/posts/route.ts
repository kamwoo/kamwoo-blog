import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { getAllPostsAdmin } from '@/server/utils/get-all-posts-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import matter from 'gray-matter';
import { upsertFile } from '@/lib/github-api';
import fs from 'fs';
import path from 'path';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const createPostSchema = z.object({
  slug: z.string().regex(slugRegex, '슬러그는 영소문자, 숫자, 하이픈만 허용됩니다'),
  frontmatter: z.object({
    title: z.string().min(1),
    date: z.string(),
    category: z.string().min(1),
    subtitle: z.string().optional(),
    published: z.boolean().optional(),
  }),
  content: z.string(),
  tmpId: z.string().optional(),
});

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const response = new NextResponse();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  return session.isAdmin === true;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const posts = getAllPostsAdmin();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { slug, frontmatter, content, tmpId } = parsed.data;

  let finalContent = content;

  // 임시 업로드 파일을 GitHub에 커밋하고 content URL 교체
  if (tmpId && UUID_RE.test(tmpId)) {
    for (const type of ['images', 'videos'] as const) {
      const tmpDir = path.join('/tmp', tmpId, type);
      if (!fs.existsSync(tmpDir)) continue;

      const files = fs.readdirSync(tmpDir);
      await Promise.all(
        files.map(async (file) => {
          const fileBuf = fs.readFileSync(path.join(tmpDir, file));
          await upsertFile(
            `src/contents/${slug}/${type}/${file}`,
            fileBuf,
            `chore: add ${type} for post ${slug}`,
          );
        }),
      );

      finalContent = finalContent.replaceAll(
        `/api/admin/tmp/${tmpId}/${type}/`,
        `/${type}/posts/${slug}/`,
      );
    }
    // 임시 디렉토리 정리
    const tmpBase = path.join('/tmp', tmpId);
    if (fs.existsSync(tmpBase)) {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    }
  }

  const fileContent = matter.stringify(finalContent, frontmatter);
  await upsertFile(
    `src/contents/${slug}/index.md`,
    fileContent,
    `post: add ${slug}`,
  );

  revalidatePath('/posts');
  revalidatePath('/posts/[id]', 'page');

  return NextResponse.json({ ok: true, slug });
}
