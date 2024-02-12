import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className='w-full flex flex-col items-center gap-y-10'>
      <div className='w-full flex flex-col justify-center items-center gap-y-6'>
        <Link href='/about' className={cn(badgeVariants({ variant: 'secondary' }), 'rounded-md')}>
          Web developer
        </Link>

        <div className='w-full flex flex-col md:flex-row justify-center gap-5'>
          <div className='w-full h-80 border-2 rounded-md border-neutral-800'></div>
          <div className='w-full h-80 border-2 rounded-md border-neutral-800'></div>
        </div>
      </div>

      <div className='w-full flex flex-col md:flex-row gap-6'>
        <div className='hidden md:block md:w-2/5 md:h-80 md:border-2 md:rounded-md md:border-neutral-800'></div>
        <div className='w-full h-80 border-2 rounded-md border-neutral-800'></div>
      </div>
    </div>
  );
};

export default HomePage;
