'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';
import { postDataSchema, postSchema } from '@/types/post';

export async function getPostMatters() {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>('/posts/api/post-matters');

  const result = postDataSchema.array().safeParse(response.data);

  if (result.success) {
    return result.data;
  }
}
