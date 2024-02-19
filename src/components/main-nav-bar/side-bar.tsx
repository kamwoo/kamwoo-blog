'use client';

import { useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger } from '../ui/sheet';
import { HomeLink } from './home-link';
import { LinkItems } from './link-items';
import { RiAlignLeft } from 'react-icons/ri';

export const SideBar = (props: React.ComponentProps<'div'>) => {
  const [open, setOpen] = useState(false);

  return (
    <div {...props}>
      <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
        <SheetTrigger className='flex items-center' onClick={() => setOpen(true)}>
          <RiAlignLeft size='20px' />
        </SheetTrigger>

        <SheetContent side='left'>
          <SheetHeader>
            <HomeLink onClick={() => setOpen(false)} />
          </SheetHeader>

          <LinkItems
            className='flex-col space-x-0 space-y-3 pt-10'
            onClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
