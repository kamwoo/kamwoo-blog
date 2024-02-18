'use server';

import { httpClient } from '@/utils/http-client';
import { GET } from './route';
import { z } from 'zod';

export async function getCategories() {
  const response = await httpClient.get<Awaited<ReturnType<typeof GET>>>('/posts/api/categories');

  const result = z
    .object({ titles: z.string().array(), category: z.string() })
    .array()
    .safeParse(response.data);

  if (result.success) {
    return result.data;
  }
}
