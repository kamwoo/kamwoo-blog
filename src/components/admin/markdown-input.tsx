'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { ImageUploader } from './image-uploader';

export interface MarkdownInputHandle {
  insertText: (text: string) => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  slug: string;
  tmpId?: string; // create 모드에서 전달
}

export const MarkdownInput = forwardRef<MarkdownInputHandle, Props>(
  ({ value, onChange, slug, tmpId }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      insertText(text: string) {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue = value.slice(0, start) + '\n' + text + '\n' + value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + text.length + 2;
          ta.focus();
        });
      },
    }));

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = textareaRef.current!;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue = value.slice(0, start) + '  ' + value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    }

    function handleInsert(text: string) {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.slice(0, start) + '\n' + text + '\n' + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + text.length + 2;
        ta.focus();
      });
    }

    return (
      <div className='flex flex-col h-full'>
        <div className='flex gap-2 px-3 py-1.5 border-b border-border bg-card'>
          <ImageUploader slug={slug} tmpId={tmpId} onInsert={handleInsert} type='image' />
          <ImageUploader slug={slug} tmpId={tmpId} onInsert={handleInsert} type='video' />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='마크다운으로 글을 작성하세요...'
          className='flex-1 w-full p-4 font-mono text-sm bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none'
          spellCheck={false}
        />
      </div>
    );
  }
);

MarkdownInput.displayName = 'MarkdownInput';
