import { Post, PostData, postSchema } from '@/types/post';
import { findPostList } from './find-post-list';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export const getPostContent = (title: string) => {
  const { list, dirPath } = findPostList();
  const data = list
    .filter((file) => typeof file === 'string' && ['.mdx', '.md'].includes(path.extname(file)))
    .reduce((prev: Post[], file) => {
      const filePath = `${dirPath}/${file}`;
      const post = fs.readFileSync(filePath, 'utf-8');
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
