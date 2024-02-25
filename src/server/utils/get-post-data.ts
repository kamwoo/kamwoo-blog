import { PostData, postSchema } from '@/types/post';
import { readPosts } from './find-post-list';
import matter from 'gray-matter';

export const getPostData = () => {
  const posts = readPosts();
  const data = posts
    .reduce((prev: PostData[], post) => {
      const { data } = postSchema.parse(matter(post));

      if (data.published !== false) {
        prev.push(data);
      }

      return prev;
    }, [])
    .sort((prev, next) => {
      return new Date(next.date).getTime() - new Date(prev.date).getTime();
    });

  return { data };
};
