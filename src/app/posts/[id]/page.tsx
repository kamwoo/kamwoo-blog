'use client';

import { trpc } from '@/shared/utils/trpc-client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Post = ({ params }: { params: { id: string } }) => {
  const { data } = trpc.postData.useQuery({ title: params.id });

  return (
    <div className='flex flex-col'>
      <div className='flex gap-1 pb-10'>
        <Link
          href='/posts'
          className='text-sm text-muted-foreground hover:underline'>{`Posts`}</Link>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm text-muted-foreground'>{data?.matter?.category}</text>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm font-medium text-foreground'>{data?.matter?.title}</text>
      </div>

      <h1 className='text-4xl font-bold tracking-tight pb-2'>{data?.matter?.title}</h1>
      <text className='text-lg text-muted-foreground'>{data?.matter?.subtitle}</text>
    </div>
  );
};

export default Post;
