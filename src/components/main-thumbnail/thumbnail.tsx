import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';

export const Thumbnail = () => {
  return (
    <AspectRatio ratio={16 / 9}>
      <Image src='/hawaii.jpeg' alt='thumbnail' fill className='rounded-md object-cover' />
    </AspectRatio>
  );
};
