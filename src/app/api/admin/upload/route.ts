import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif']);
const VIDEO_EXTS = new Set(['.mp4', '.mov']);
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const response = new NextResponse();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  return session.isAdmin === true;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;
  const tmpId = formData.get('tmpId') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'file이 필요합니다' }, { status: 400 });
  }
  if (!slug && !tmpId) {
    return NextResponse.json({ error: 'slug 또는 tmpId가 필요합니다' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다' }, { status: 400 });
  }

  const originalName = path.basename(file.name);
  const ext = path.extname(originalName).toLowerCase();
  const isImage = IMAGE_EXTS.has(ext);
  const isVideo = VIDEO_EXTS.has(ext);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다' }, { status: 400 });
  }

  const type = isImage ? 'images' : 'videos';
  const bytes = new Uint8Array(await file.arrayBuffer());
  const cwd = process.cwd();

  // create 모드: 임시 디렉토리에 저장
  if (tmpId) {
    if (!UUID_RE.test(tmpId)) {
      return NextResponse.json({ error: '잘못된 tmpId입니다' }, { status: 400 });
    }
    const dir = path.resolve(cwd, 'public/_tmp', tmpId, type);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, originalName), bytes);
    return NextResponse.json({ url: `/_tmp/${tmpId}/${type}/${originalName}` });
  }

  // edit 모드: slug 기반 저장
  if (slug!.includes('/') || slug!.includes('..') || slug!.includes('\\')) {
    return NextResponse.json({ error: '잘못된 슬러그입니다' }, { status: 400 });
  }

  const srcDir = path.resolve(cwd, 'src/contents', slug!, type);
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, originalName), bytes);

  const publicDir = path.resolve(cwd, 'public', type, 'posts', slug!);
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, originalName), bytes);

  return NextResponse.json({ url: `/${type}/posts/${slug}/${originalName}` });
}
