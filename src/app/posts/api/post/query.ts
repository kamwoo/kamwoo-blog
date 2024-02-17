'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';

export async function getPost(title: string) {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>(`/posts/api/post`, {
    params: { title },
  });

  return response.data;
}
