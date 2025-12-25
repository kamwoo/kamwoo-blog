import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { MainNavBar } from '@/components/main-nav-bar';
import { MainFooter } from '@/components/main-footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Kamwoo blog',
  description: 'web/tech',
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <ThemeProvider attribute='class' forcedTheme='dark' disableTransitionOnChange>
          <MainNavBar />
          <div className='min-h-screen pt-14'>{children}</div>
          <MainFooter />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
