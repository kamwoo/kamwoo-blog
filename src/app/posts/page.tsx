'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPostMatters } from './api/post-matters/query';
import { PostPagination } from '@/components/posts/post-pagination';
import { usePagination } from '@/hooks/use-pagination';
import { PostData, postSchema } from '@/types/post';
import { useEffect, useState } from 'react';

const PostsPage = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const { contents, register } = usePagination({ contents: posts, presentContentCount: 6 });

  useEffect(() => {
    const getPost = async () => {
      getPostMatters().then((posts) => {
        if (posts) setPosts(posts);
      });
    };

    getPost();
  }, []);

  return (
    <div className='flex flex-col md:max-2xl:max-w-lg 2xl:max-w-screen-md gap-20 pb-12'>
      <div className='flex flex-col gap-10 pt-4 px-6 md:px-0 '>
        {contents.map(({ title, subtitle, category }, index) => (
          <Link
            href={`/posts/${title}`}
            key={`${title}${index}`}
            className='flex flex-col cursor-pointer group'>
            <div className='flex gap-1 pb-3'>
              <text className='text-sm text-muted-foreground'>{`Posts`}</text>
              <ChevronRight size='20px' stroke='gray' />
              <text className='text-sm font-medium text-foreground'>{category}</text>
            </div>
            <text className='text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight pb-2 group-hover:underline'>
              {title}
            </text>
            <text className='text-md md:text-lg text-muted-foreground'>{subtitle}</text>
          </Link>
        ))}
      </div>

      <PostPagination {...register()} />
    </div>
  );
};

export default PostsPage;
