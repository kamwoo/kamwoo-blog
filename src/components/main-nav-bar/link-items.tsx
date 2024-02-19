import { cn } from '@/lib/utils';
import Link, { LinkProps } from 'next/link';

export const LinkItems = ({
  className,
  onClick,
}: React.ComponentProps<'div'> & Omit<LinkProps, 'href'>) => {
  return (
    <div className={cn('flex space-x-5', className)}>
      <Link href='/about' onClick={onClick}>
        <text className='font-medium text-sm text-neutral-400 hover:text-neutral-200'>About</text>
      </Link>

      <Link href='/posts' onClick={onClick}>
        <text className='font-medium text-sm text-neutral-400 hover:text-neutral-200'>Posts</text>
      </Link>

      <Link href='/portfolios' onClick={onClick}>
        <text className='font-medium text-sm text-neutral-400 hover:text-neutral-200'>
          Portfolios
        </text>
      </Link>

      <Link href='https://github.com/kamwoo' onClick={onClick}>
        <text className='font-medium text-sm text-neutral-400 hover:text-neutral-200'>Github</text>
      </Link>
    </div>
  );
};
