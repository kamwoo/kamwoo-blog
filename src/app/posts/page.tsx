import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPostData } from '@/server/utils/get-post-data';

const PostsPage = async () => {
  const { data: contents } = getPostData();

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
    </div>
  );
};

export default PostsPage;
