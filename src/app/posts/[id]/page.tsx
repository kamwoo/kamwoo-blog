import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPost } from '../api/post/query';
import { PostBody } from '@/components/post/post-body';

const Post = async ({ params }: { params: { id: string } }) => {
  const { matter, content } = await getPost(params.id);

  return (
    <div className='flex flex-col px-8 md:px-0'>
      <div className='flex gap-1 pb-10'>
        <Link
          href='/posts'
          className='text-sm text-muted-foreground hover:underline'>{`Posts`}</Link>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm text-muted-foreground'>{matter?.category}</text>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm font-medium text-foreground'>{matter?.title}</text>
      </div>

      <h1 className='text-3xl md:text-4xl font-bold tracking-tight pb-2'>{matter?.title}</h1>
      <text className='text-md  md:text-lg text-muted-foreground'>{matter?.subtitle}</text>

      <div className='pt-10'>
        <PostBody content={content || ''} />
      </div>
    </div>
  );
};

export default Post;
