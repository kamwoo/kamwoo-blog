import { readPosts } from './find-post-list';
import matter from 'gray-matter';
import { postSchema } from '@/types/post';
import { PostData } from '@/types/post';

export function getAllPostsAdmin(): Array<{ folderName: string; data: PostData }> {
  const posts = readPosts();
  return posts
    .map(({ folderName, raw }) => {
      try {
        const { data } = postSchema.parse(matter(raw));
        return { folderName, data };
      } catch {
        return null;
      }
    })
    .filter((p): p is { folderName: string; data: PostData } => p !== null)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}
