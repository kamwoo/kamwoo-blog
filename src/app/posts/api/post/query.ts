'use server';

import { postSchema } from '@/types/post';
import { getPostContent } from '@/server/utils/get-post-content';

export async function getPost(title: string) {
  const { data, content } = getPostContent(title);

  const result = postSchema.safeParse({ data, content });

  if (result.success) {
    return result.data;
  }
}
