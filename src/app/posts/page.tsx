import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPostMatters } from './api/post-matters/query';

const PostsPage = async () => {
  const posts = await getPostMatters();

  return (
    <div className='flex flex-col md:max-2xl:max-w-lg 2xl:max-w-screen-md gap-20 pb-12'>
      <div className='flex flex-col gap-10 pt-4 px-6 md:px-0 '>
        {posts.map(({ title, subtitle, category }) => (
          <Link href={`/posts/${title}`} key={title} className='flex flex-col cursor-pointer group'>
            <div className='flex gap-1 pb-3'>
              <text className='text-sm text-muted-foreground'>{`Posts`}</text>
              <ChevronRight size='20px' stroke='gray' />
              <text className='text-sm font-medium text-foreground'>{category}</text>
            </div>
            <text className='text-3xl md:text-4xl font-bold text-neutral-100 tracking-tight pb-2 group-hover:underline'>
              {title}
            </text>
            <text className='text-md md:text-lg text-muted-foreground'>{subtitle}</text>
          </Link>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href='#' isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href='#'>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href='#'>3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#' />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PostsPage;
