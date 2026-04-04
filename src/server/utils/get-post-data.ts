import { PostData, postSchema } from '@/types/post';
import { readPosts } from './find-post-list';
import matter from 'gray-matter';
import { cache } from 'react';

export const getPostData = cache(() => {
  const posts = readPosts();
  const folderMap: Record<string, string> = {};

  const data = posts
    .reduce((prev: PostData[], { folderName, raw }) => {
      const { data } = postSchema.parse(matter(raw));

      if (data.published !== false) {
        if (data.title) {
          folderMap[data.title] = folderName;
        }
        prev.push(data);
      }

      return prev;
    }, [])
    .sort((prev, next) => {
      return new Date(next.date).getTime() - new Date(prev.date).getTime();
    });

  return { data, folderMap };
});
