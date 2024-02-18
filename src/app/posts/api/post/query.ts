'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';
import { postSchema } from '@/types/post';

export async function getPost(title: string) {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>(`/posts/api/post`, {
    params: { title },
  });

  const result = postSchema.safeParse(response.data);

  if (result.success) {
    return result.data;
  }
}
