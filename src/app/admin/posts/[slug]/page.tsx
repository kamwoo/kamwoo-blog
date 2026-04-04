import { notFound } from 'next/navigation';
import { PostEditor } from '@/components/admin/post-editor';
import { getAllPostsAdmin } from '@/server/utils/get-all-posts-admin';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface Props {
  params: { slug: string };
}

export default function EditPostPage({ params }: Props) {
  const filePath = path.resolve(process.cwd(), 'src/contents', params.slug, 'index.md');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const posts = getAllPostsAdmin();
  const categories = [...new Set(posts.map((p) => p.data.category).filter(Boolean))].sort();

  return (
    <PostEditor
      mode='edit'
      initialSlug={params.slug}
      initialFrontmatter={data}
      initialContent={content.trim()}
      categories={categories}
    />
  );
}
