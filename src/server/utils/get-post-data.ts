import { PostData, postSchema } from '@/shared/types/post';
import { findPostList } from './find-post-list';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export const getPostData = () => {
  const { list, dirPath } = findPostList();
  const data = list
    .filter((file) => typeof file === 'string' && ['.mdx', '.md'].includes(path.extname(file)))
    .reduce((prev: PostData[], file) => {
      const filePath = `${dirPath}/${file}`;
      const post = fs.readFileSync(filePath, 'utf-8');
      const { data } = postSchema.parse(matter(post));

      if (data.published !== false) {
        prev.push({ ...data });
      }

      return prev;
    }, []);

  return { data };
};
