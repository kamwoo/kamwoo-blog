import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { getCategories } from './api/categories/query';
import { useState } from 'react';

const PostLayout = async ({ children }: { children: React.ReactNode }) => {
  const categoryData = await getCategories();

  return (
    <div className='h-full flex md:pl-40 md:pr-28 pt-12 gap-16'>
      <ScrollArea
        className='hidden md:block w-52 h-fit sticky top-20'
        style={{ position: 'sticky' }}>
        <Accordion className='flex flex-col gap-0' type='multiple'>
          {categoryData?.map(({ category, titles }) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger>
                <Link href={`/posts?category=${category}`}>{category}</Link>
              </AccordionTrigger>
              <AccordionContent>
                <div className='flex flex-col gap-3'>
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

      <div className='flex-1 items-start'>{children}</div>
    </div>
  );
};

export default PostLayout;
