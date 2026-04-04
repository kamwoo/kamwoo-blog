import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { getAllPostsAdmin } from '@/server/utils/get-all-posts-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import matter from 'gray-matter';
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
  const cwd = process.cwd();
  const contentsDir = path.resolve(cwd, 'src/contents', slug);

  if (fs.existsSync(contentsDir)) {
    return NextResponse.json({ error: '이미 존재하는 슬러그입니다' }, { status: 409 });
  }

  fs.mkdirSync(contentsDir, { recursive: true });

  // 임시 업로드 파일을 실제 위치로 이동하고 content URL 교체
  let finalContent = content;
  if (tmpId && UUID_RE.test(tmpId)) {
    const tmpBase = path.resolve(cwd, 'public/_tmp', tmpId);
    for (const type of ['images', 'videos'] as const) {
      const tmpDir = path.join(tmpBase, type);
      if (!fs.existsSync(tmpDir)) continue;

      const destPublic = path.resolve(cwd, 'public', type, 'posts', slug);
      const destSrc = path.resolve(cwd, 'src/contents', slug, type);
      fs.mkdirSync(destPublic, { recursive: true });
      fs.mkdirSync(destSrc, { recursive: true });

      for (const file of fs.readdirSync(tmpDir)) {
        const src = path.join(tmpDir, file);
        const dst = path.join(destPublic, file);
        fs.renameSync(src, dst);
        fs.copyFileSync(dst, path.join(destSrc, file));
      }

      finalContent = finalContent.replaceAll(
        `/_tmp/${tmpId}/${type}/`,
        `/${type}/posts/${slug}/`
      );
    }
    // 임시 디렉토리 정리
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }

  const fileContent = matter.stringify(finalContent, frontmatter);
  fs.writeFileSync(path.join(contentsDir, 'index.md'), fileContent, 'utf-8');

  revalidatePath('/posts');
  revalidatePath('/posts/[id]', 'page');

  return NextResponse.json({ ok: true, slug });
}
