import Link, { LinkProps } from 'next/link';

export const HomeLink = (props: Omit<LinkProps, 'href'>) => {
  return (
    <Link href='/posts' {...props}>
      <text className='font-bold text-md'>Kamwoo</text>
      <text className='font-bold text-md text-neutral-400'> blog</text>
    </Link>
  );
};
