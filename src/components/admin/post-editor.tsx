'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FrontmatterForm, FrontmatterState } from './frontmatter-form';
import { MarkdownInput, MarkdownInputHandle } from './markdown-input';
import { MarkdownPreview } from './markdown-preview';
import { PostData } from '@/types/post';

interface Props {
  mode: 'create' | 'edit';
  initialSlug?: string;
  initialFrontmatter?: Partial<PostData>;
  initialContent?: string;
  categories?: string[];
}

function toDateString(date: string | Date | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return date.slice(0, 10);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function PostEditor({ mode, initialSlug = '', initialFrontmatter, initialContent = '', categories = [] }: Props) {
  const router = useRouter();
  const inputRef = useRef<MarkdownInputHandle>(null);

  // create 모드: 임시 업로드 디렉토리 식별자 (세션 동안 고정)
  const [sessionId] = useState(() => crypto.randomUUID());

  const [slug, setSlug] = useState(initialSlug);
  const [frontmatter, setFrontmatter] = useState<FrontmatterState>({
    title: initialFrontmatter?.title ?? '',
    category: initialFrontmatter?.category ?? '',
    subtitle: (initialFrontmatter?.subtitle as string) ?? '',
    date: toDateString(initialFrontmatter?.date),
    published: initialFrontmatter?.published ?? false,
  });
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleFrontmatterChange(val: FrontmatterState) {
    setFrontmatter(val);
    if (mode === 'create' && val.title !== frontmatter.title) {
      setSlug(slugify(val.title));
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleSave() {
    setError('');
    if (!frontmatter.title.trim()) { setError('제목을 입력하세요'); return; }
    if (!frontmatter.category.trim()) { setError('카테고리를 입력하세요'); return; }
    if (!slug.trim()) { setError('슬러그를 입력하세요'); return; }

    setSaving(true);
    try {
      const fm: Record<string, unknown> = {
        title: frontmatter.title,
        date: frontmatter.date,
        category: frontmatter.category,
        published: frontmatter.published,
      };
      if (frontmatter.subtitle) fm.subtitle = frontmatter.subtitle;

      if (mode === 'create') {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // tmpId 전달 → API에서 임시 파일을 실제 위치로 이동
          body: JSON.stringify({ slug, frontmatter: fm, content, tmpId: sessionId }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        router.push('/admin');
      } else {
        const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frontmatter: fm, content }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        router.push('/admin');
      }
    } catch {
      setError('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  }

  const isCreate = mode === 'create';

  return (
    <div className='flex flex-col h-screen bg-background'>
      {/* 헤더 */}
      <div className='flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0'>
        <div className='flex items-center gap-3'>
          <a href='/admin' className='text-sm text-muted-foreground hover:text-foreground'>
            ← 목록
          </a>
          <span className='text-sm text-muted-foreground'>
            {isCreate ? '새 포스트' : `편집: ${slug}`}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {error && <span className='text-sm text-destructive'>{error}</span>}
          <Button size='sm' onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
          <button
            onClick={handleLogout}
            className='text-xs text-muted-foreground hover:text-foreground px-2'
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Frontmatter 폼 */}
      <FrontmatterForm
        value={frontmatter}
        onChange={handleFrontmatterChange}
        slug={slug}
        onSlugChange={isCreate ? setSlug : undefined}
        slugEditable={isCreate}
        categories={categories}
      />

      {/* 에디터 / 미리보기 split pane */}
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex-1 overflow-hidden'>
          <MarkdownInput
            ref={inputRef}
            value={content}
            onChange={setContent}
            slug={slug}
            tmpId={isCreate ? sessionId : undefined}
          />
        </div>
        <div className='flex-1 overflow-hidden'>
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
