import { getPostData } from '@/server/utils/get-post-data';
import { response } from '@/utils/response';

export async function GET() {
  const { data } = getPostData();

  return response(data);
}
