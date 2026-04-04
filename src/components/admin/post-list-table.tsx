'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostData } from '@/types/post';

interface Post {
  folderName: string;
  data: PostData;
}

export function PostListTable({ posts: initialPosts }: { posts: Post[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.folderName !== slug));
    } else {
      const data = await res.json();
      alert(data.error || '삭제 실패');
    }
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border text-muted-foreground'>
            <th className='text-left py-2 px-3 font-medium'>제목</th>
            <th className='text-left py-2 px-3 font-medium'>카테고리</th>
            <th className='text-left py-2 px-3 font-medium'>날짜</th>
            <th className='text-left py-2 px-3 font-medium'>상태</th>
            <th className='py-2 px-3' />
          </tr>
        </thead>
        <tbody>
          {posts.map(({ folderName, data }) => (
            <tr key={folderName} className='border-b border-border hover:bg-secondary/50 transition-colors'>
              <td className='py-2 px-3 text-foreground max-w-xs truncate'>{data.title}</td>
              <td className='py-2 px-3 text-muted-foreground'>{data.category}</td>
              <td className='py-2 px-3 text-muted-foreground whitespace-nowrap'>
                {String(data.date).slice(0, 10)}
              </td>
              <td className='py-2 px-3'>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    data.published !== false
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {data.published !== false ? '공개' : '비공개'}
                </span>
              </td>
              <td className='py-2 px-3'>
                <div className='flex gap-2 justify-end'>
                  <a
                    href={`/posts/${encodeURIComponent(data.title ?? folderName)}`}
                    target='_blank'
                    className='text-xs text-muted-foreground hover:text-foreground'
                  >
                    보기
                  </a>
                  <button
                    onClick={() => router.push(`/admin/posts/${encodeURIComponent(folderName)}`)}
                    className='text-xs text-muted-foreground hover:text-foreground'
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(folderName, data.title ?? folderName)}
                    className='text-xs text-destructive hover:text-destructive/80'
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={5} className='py-8 text-center text-muted-foreground'>
                포스트가 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
