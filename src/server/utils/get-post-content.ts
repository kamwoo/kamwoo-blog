import path from 'path';
import fs from 'fs';
import { cache } from 'react';
import { postSchema } from '@/types/post';
import { getPostData } from './get-post-data';
import matter from 'gray-matter';

export const getPostContent = cache((title: string) => {
  const decodedTitle = decodeURI(title);
  const { folderMap } = getPostData();
  const folderName = folderMap[decodedTitle];

  if (!folderName) {
    return { data: undefined, content: undefined };
  }

  const filePath = path.resolve(
    process.cwd(),
    `./src/contents/${folderName}/index.md`
  );

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = postSchema.parse(matter(raw));

  return { data, content };
});
