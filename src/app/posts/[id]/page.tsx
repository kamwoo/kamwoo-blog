import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPost, getPrevNextPostMatter } from '../api/post/query';
import { PostBody } from '@/components/post/post-body';

const Post = async ({ params }: { params: { id: string } }) => {
  const response = await getPost(params.id);
  const { prev, next } = await getPrevNextPostMatter(params.id);

  return (
    <div className='flex w-screen md:w-full flex-col px-6 md:px-0'>
      <div className='flex gap-1 pb-10'>
        <Link
          href='/posts'
          className='text-sm text-muted-foreground hover:underline'>{`Posts`}</Link>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm text-muted-foreground'>{response?.data.category}</text>

        <ChevronRight size='20px' stroke='gray' />
        <text className='text-sm font-medium text-foreground'>{response?.data.title}</text>
      </div>

      <h1 className='text-3xl md:text-4xl font-bold tracking-tight pb-2'>{response?.data.title}</h1>
      <text className='text-md md:text-lg text-muted-foreground'>{response?.data.subtitle}</text>

      <div className='flex-1 md:max-2xl:max-w-2xl 2xl:max-w-screen-md pt-10'>
        <PostBody content={response?.content || ''} />

        <div className='flex w-full justify-between pt-10 border-t-2 mt-20'>
          <div className='flex flex-col items-start max-w-40 md:max-w-80'>
            {prev && (
              <>
                <text className='text-sm font-medium text-muted-foreground'>Previous</text>
                <Link href={`/posts/${prev.title}`} className='flex items-center gap-2'>
                  <ChevronLeft stroke='lightgray' size='20px' />
                  <text className='text-lg whitespace-pre-wrap'>{prev.title}</text>
                </Link>
              </>
            )}
          </div>
          <div className='flex flex-col items-end max-w-40 md:max-w-80'>
            {next && (
              <>
                <text className='text-sm font-medium text-muted-foreground'>Next</text>
                <Link href={`/posts/${next.title}`} className='flex items-center gap-2'>
                  <text className='text-lg whitespace-pre-wrap'>{next.title}</text>
                  <ChevronRight stroke='lightgray' size='20px' />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
