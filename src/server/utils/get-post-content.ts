import { Post, PostData, postSchema } from '@/types/post';
import { readPosts } from './find-post-list';
import matter from 'gray-matter';

export const getPostContent = (title: string) => {
  const posts = readPosts();
  const data = posts.reduce((prev: Post[], post) => {
    const { data, content } = postSchema.parse(matter(post));

    if (data.published !== false) {
      prev.push({ data, content });
    }

    return prev;
  }, []);

  const targetData = data.find(({ data }) => {
    return data.title === decodeURI(title);
  });

  return { data: targetData?.data, content: targetData?.content };
};
