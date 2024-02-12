import Link from 'next/link';

export const HomeLink = () => {
  return (
    <Link href='/home'>
      <text className='font-bold text-md'>Kamwoo</text>
      <text className='font-bold text-md text-neutral-400'>/dev</text>
    </Link>
  );
};
