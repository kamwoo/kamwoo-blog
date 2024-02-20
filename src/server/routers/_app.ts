import { z } from 'zod';
import { procedure, router } from '../trpc';
import { getPostContent } from '../utils/get-post-content';
import { getPostData } from '../utils/get-post-data';

export const appRouter = router({
  postList: procedure.query((opts) => {
    const { data } = getPostData();

    return { list: data };
  }),

  postCategory: procedure.query(() => {
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

    return { category: categoryDict };
  }),

  postData: procedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(({ input: { title } }) => {
      const { data, content } = getPostContent(title);

      return { data, content };
    }),
});

export type AppRouter = typeof appRouter;
