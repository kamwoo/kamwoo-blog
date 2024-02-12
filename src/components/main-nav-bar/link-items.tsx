import { cn } from '@/lib/utils';
import Link from 'next/link';

export const LinkItems = ({ className }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('flex space-x-5', className)}>
      <Link href='/about'>
        <text className='font-bold text-sm text-neutral-400 hover:text-neutral-200'>About</text>
      </Link>

      <Link href='/posts'>
        <text className='font-bold text-sm text-neutral-400 hover:text-neutral-200'>Posts</text>
      </Link>

      <Link href='/portfolios'>
        <text className='font-bold text-sm text-neutral-400 hover:text-neutral-200'>
          Portfolios
        </text>
      </Link>

      <Link href='https://github.com/kamwoo'>
        <text className='font-bold text-sm text-neutral-400 hover:text-neutral-200'>Github</text>
      </Link>
    </div>
  );
};
