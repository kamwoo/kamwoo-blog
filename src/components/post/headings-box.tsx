import { cn } from '@/lib/utils';
import { HTMLAttributes, HTMLProps } from 'react';

export const HeadingsBox = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('flex flex-col', className)} {...props}></div>;
};
