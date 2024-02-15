import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { LinkItems } from './link-items';
import { HomeLink } from './home-link';
import { SideBar } from './side-bar';

interface NavbarProps {
  children?: React.ReactNode;
}

export const NavBar = ({ children }: NavbarProps) => {
  return (
    <div className='w-full h-14 fixed top-0 z-10 bg-background border-b-2 border-neutral-900 flex justify-center'>
      <div className='w-full max-w-screen-2xl flex justify-between items-center px-6 md:px-14'>
        <SideBar className='md:hidden' />

        <div className='flex space-x-6 md:justify-center md:space-x-10'>
          <HomeLink />
          <LinkItems className='hidden md:flex' />
        </div>

        <Link href='https://github.com/kamwoo' rel='noopener noreferrer' target='_blank'>
          <Avatar className='w-6 h-6'>
            <AvatarImage src='/github-mark.png'></AvatarImage>
            <AvatarFallback>Github</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
};
