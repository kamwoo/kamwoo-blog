'use server';

import { postDataSchema, postSchema } from '@/types/post';
import { getPostContent } from '@/server/utils/get-post-content';
import { getPostData } from '@/server/utils/get-post-data';

export async function getPost(title: string) {
  const { data, content } = getPostContent(title);

  const result = postSchema.safeParse({ data, content });

  if (result.success) {
    return result.data;
  }
}

export async function getPrevNextPostMatter(title: string) {
  const { data } = getPostData();
  const currentPostIndex = data.findIndex(({ title: dataTitle }) => dataTitle === decodeURI(title));

  if (typeof currentPostIndex !== 'number' || currentPostIndex === -1) {
    return { prev: null, next: null };
  }

  if (currentPostIndex === 0) {
    return { prev: null, next: data[currentPostIndex + 1] };
  }

  if (currentPostIndex === data.length - 1) {
    return { prev: data[currentPostIndex - 1], next: null };
  }

  return { prev: data[currentPostIndex - 1], next: data[currentPostIndex + 1] };
}
