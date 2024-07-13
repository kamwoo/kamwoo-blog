'use client';

import { useEffect, useState } from 'react';

interface Props {
  data: string;
  href: string;
}

export const OGBox = ({ data, href }: Props) => {
  const [og, setData] = useState<{
    image: string;
    title: string;
    description: string;
    url: string;
  }>();

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const description =
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const url = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';

    setData({ image, title, description, url });
  }, []);

  return og && og.title ? (
    <a
      href={og.url}
      className='pointer w-full h-16 md:h-28 flex justify-between bg-slate-900 py-0 no-underline rounded-sm my-4 hover:bg-slate-950'>
      <span className='flex flex-col h-full py-2 px-3 md:py-3 md:px-4 space-y-2 overflow-hidden'>
        <span className='text-slate-200 text-xs md:text-base font-semibold'>{og.title}</span>
        <span className='text-slate-200 text-xs md:text-sm overflow-hidden text-ellipsis whitespace-nowrap'>
          {og.description}
        </span>
      </span>
      <img
        src={og.image}
        onError={(element) => element.currentTarget.classList.add('hidden')}
        className='my-0 !important w-1/3 object-cover rounded-r-sm'
      />
    </a>
  ) : (
    <a href={href}>{href}</a>
  );
};
