import Link from 'next/link';
import { getAllPostsAdmin } from '@/server/utils/get-all-posts-admin';
import { PostListTable } from '@/components/admin/post-list-table';
import { LogoutButton } from '@/components/admin/logout-button';

export default function AdminPage() {
  const posts = getAllPostsAdmin();

  return (
    <div className='min-h-screen bg-background'>
      <div className='flex items-center justify-between px-6 py-3 border-b border-border bg-card'>
        <h1 className='text-base font-semibold text-foreground'>Admin</h1>
        <div className='flex items-center gap-3'>
          <Link
            href='/admin/posts/new'
            className='px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            + 새 포스트
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-6 py-6'>
        <p className='text-sm text-muted-foreground mb-4'>전체 {posts.length}개 포스트</p>
        <PostListTable posts={posts} />
      </div>
    </div>
  );
}
