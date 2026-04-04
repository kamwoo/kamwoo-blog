import { PostEditor } from '@/components/admin/post-editor';
import { getAllPostsAdmin } from '@/server/utils/get-all-posts-admin';

export default function NewPostPage() {
  const posts = getAllPostsAdmin();
  const categories = Array.from(new Set(posts.map((p) => p.data.category).filter(Boolean))).sort();

  return <PostEditor mode='create' categories={categories} />;
}
