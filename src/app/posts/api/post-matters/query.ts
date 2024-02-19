'use server';

import { postDataSchema, postSchema } from '@/types/post';
import { getPostData } from '@/server/utils/get-post-data';

export async function getPostMatters() {
  const { data } = getPostData();

  const result = postDataSchema.array().safeParse(data);

  if (result.success) {
    return result.data;
  }
}
