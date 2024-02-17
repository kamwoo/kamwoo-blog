'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';

export async function getCategories() {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>('/posts/api/categories');

  return response.data;
}
