import { getPostContent } from '@/server/utils/get-post-content';
import { response } from '@/utils/response';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return response({ matter: null, content: null });
  }

  const { matter, content } = getPostContent(title);

  return response({ matter, content });
}
