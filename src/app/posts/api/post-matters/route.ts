import { getPostData } from '@/server/utils/get-post-data';

export async function GET() {
  const { data } = getPostData();

  return Response.json(data);
}
