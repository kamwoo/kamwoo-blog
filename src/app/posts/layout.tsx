'use client';

import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { trpc } from '@/shared/utils/trpc-client';

const PostLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: categoryData } = trpc.postCategory.useQuery();

  return (
    <div className='h-full flex px-12 md:px-48 pt-6 gap-16'>
      <ScrollArea className='w-48 h-fit sticky top-20' style={{ position: 'sticky' }}>
        <Accordion className='flex flex-col gap-0' type='multiple'>
          {categoryData?.category.map(({ category, titles }) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger>{category}</AccordionTrigger>
              <AccordionContent>
                <div className='flex flex-col gap-1'>
                  {titles.map((title) => (
                    <Link
                      key={title}
                      href={`/posts/${title}`}
                      className='text-md hover:underline text-muted-foreground cursor-pointer'>
                      {title}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      {children}
    </div>
  );
};

export default PostLayout;
