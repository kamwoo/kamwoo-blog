import { DialogProps } from '@radix-ui/react-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '../ui/sheet';
import { HomeLink } from './home-link';
import { LinkItems } from './link-items';
import { RiAlignLeft } from 'react-icons/ri';

export const SideBar = (props: React.ComponentProps<'div'>) => {
  return (
    <div {...props}>
      <Sheet>
        <SheetTrigger className='flex items-center'>
          <RiAlignLeft size='20px' />
        </SheetTrigger>

        <SheetContent side='left'>
          <SheetHeader>
            <HomeLink />
          </SheetHeader>

          <LinkItems className='flex-col space-x-0 space-y-3 pt-10' />
        </SheetContent>
      </Sheet>
    </div>
  );
};
