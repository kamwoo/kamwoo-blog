import { getPostContent } from '@/server/utils/get-post-content';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return Response.json({ data: undefined, content: undefined });
  }

  const { data, content } = getPostContent(title);

  return Response.json({ data, content });
}
