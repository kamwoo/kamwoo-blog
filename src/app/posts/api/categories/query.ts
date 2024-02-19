'use server';

import { z } from 'zod';
import { getPostData } from '@/server/utils/get-post-data';

export async function getCategories() {
  const { data } = getPostData();

  const categories = data.map(({ category }) => category);

  const categoryDict = categories
    .filter((value, index) => categories.indexOf(value) === index)
    .map((category) => ({ category, titles: [] as string[] }));

  data.forEach(({ category, title }) => {
    const target = categoryDict.find(({ category: key }) => key === category);

    if (target && title) {
      target.titles.push(title);
    }
  });

  const result = z
    .object({ titles: z.string().array(), category: z.string() })
    .array()
    .safeParse(categoryDict);

  if (result.success) {
    return result.data;
  }
}
