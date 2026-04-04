'use client';

import { useRef, useState } from 'react';

interface Props {
  slug: string;     // edit 모드: 실제 slug
  tmpId?: string;   // create 모드: 임시 디렉토리 ID
  onInsert: (text: string) => void;
  type?: 'image' | 'video';
}

interface PendingUpload {
  url: string;
  name: string;
}

type Align = 'left' | 'center';

export function ImageUploader({ slug, tmpId, onInsert, type = 'image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [width, setWidth] = useState('400');
  const [height, setHeight] = useState('100');
  const [align, setAlign] = useState<Align>('left');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = '';

    const formData = new FormData();
    formData.append('file', file);
    if (tmpId) {
      formData.append('tmpId', tmpId);
    } else {
      formData.append('slug', slug);
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '업로드 실패');
        return;
      }

      setWidth('400');
      setHeight('100');
      setAlign('left');
      setPending({ url: data.url, name: file.name });
    } catch {
      alert('업로드 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
    }
  }

  function buildInner(): string {
    const w = width.trim();
    const h = height.trim();
    if (!pending) return '';

    if (type === 'image') {
      if (w || h) {
        const wAttr = w ? ` width="${w}"` : '';
        const hAttr = h ? ` height="${h}"` : '';
        return `<img src="${pending.url}" alt="${pending.name}"${wAttr}${hAttr} />`;
      }
      return `![${pending.name}](${pending.url})`;
    } else {
      const wAttr = w ? ` width="${w}"` : ` style="max-width:100%"`;
      return `<video src="${pending.url}" controls${wAttr} />`;
    }
  }

  function handleInsert() {
    if (!pending) return;
    const inner = buildInner();
    const markdown =
      align === 'center'
        ? `<div style="display:flex;justify-content:center">${inner}</div>`
        : inner;
    onInsert(markdown);
    setPending(null);
  }

  const accept = type === 'image' ? '.png,.jpg,.jpeg,.gif' : '.mp4,.mov';
  const label = type === 'image' ? '이미지' : '동영상';

  const alignBtnClass = (a: Align) =>
    `px-2 py-0.5 text-xs rounded border transition-colors ${
      align === a
        ? 'border-primary text-primary bg-primary/10'
        : 'border-border text-muted-foreground hover:text-foreground'
    }`;

  if (pending) {
    return (
      <div className='flex items-center gap-1.5 flex-wrap'>
        <span className='text-xs text-muted-foreground max-w-[120px] truncate' title={pending.name}>
          {pending.name}
        </span>
        <input
          type='number'
          placeholder='width'
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className='w-16 px-1.5 py-0.5 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
          min={1}
        />
        <input
          type='number'
          placeholder='height'
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className='w-16 px-1.5 py-0.5 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
          min={1}
        />
        <button type='button' onClick={() => setAlign('left')} className={alignBtnClass('left')}>
          왼쪽
        </button>
        <button type='button' onClick={() => setAlign('center')} className={alignBtnClass('center')}>
          중앙
        </button>
        <button
          type='button'
          onClick={handleInsert}
          className='px-2 py-0.5 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity'
        >
          삽입
        </button>
        <button
          type='button'
          onClick={() => setPending(null)}
          className='px-2 py-0.5 text-xs rounded border border-border text-muted-foreground hover:text-foreground transition-colors'
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='hidden'
      />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className='px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50'
      >
        {uploading ? '업로드 중...' : `${label} 업로드`}
      </button>
    </>
  );
}
