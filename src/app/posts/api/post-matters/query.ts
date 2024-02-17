'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';

export async function getPostMatters() {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>('/posts/api/post-matters');

  return response.data;
}
