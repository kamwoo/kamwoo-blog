import { z } from 'zod';

export const postDataSchema = z.object({
  title: z.string().optional(),
  date: z.union([z.date(), z.string()]),
  published: z.boolean().optional(),
  category: z.string(),
  subtitle: z.string().optional(),
});

export const postSchema = z.object({
  data: postDataSchema,
  content: z.string().optional(),
});

export type Post = z.infer<typeof postSchema>;
export type PostData = z.infer<typeof postDataSchema>;
