import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import matter from 'gray-matter';
import { upsertFile, deleteDir } from '@/lib/github-api';
import fs from 'fs';
import path from 'path';

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const response = new NextResponse();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  return session.isAdmin === true;
}

function getPostPath(slug: string) {
  return path.resolve(process.cwd(), 'src/contents', slug);
}

const updatePostSchema = z.object({
  frontmatter: z.object({
    title: z.string().min(1),
    date: z.string(),
    category: z.string().min(1),
    subtitle: z.string().optional(),
    published: z.boolean().optional(),
  }),
  content: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filePath = path.join(getPostPath(params.slug), 'index.md');
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return NextResponse.json({ slug: params.slug, data, content });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filePath = path.join(getPostPath(params.slug), 'index.md');
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { frontmatter, content } = parsed.data;
  const fileContent = matter.stringify(content, frontmatter);
  await upsertFile(
    `src/contents/${params.slug}/index.md`,
    fileContent,
    `post: update ${params.slug}`,
  );

  revalidatePath('/posts');
  revalidatePath('/posts/[id]', 'page');

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postDir = getPostPath(params.slug);
  if (!fs.existsSync(postDir)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await deleteDir(`src/contents/${params.slug}`, `post: delete ${params.slug}`);

  revalidatePath('/posts');
  revalidatePath('/posts/[id]', 'page');

  return NextResponse.json({ ok: true });
}
