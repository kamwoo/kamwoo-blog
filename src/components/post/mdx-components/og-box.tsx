'use client';

import { useEffect, useState } from 'react';

interface Props {
  data: string;
}

export const OGBox = ({ data }: Props) => {
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

  return (
    og && (
      <a
        href={og.url}
        className='pointer w-full h-28 flex justify-between bg-slate-900 py-0 no-underline rounded-sm'>
        <span className='flex flex-col h-full py-3 px-4 space-y-2 overflow-hidden'>
          <span className='text-slate-200 font-semibold'>{og.title}</span>
          <span className='h-full text-slate-200 text-sm overflow-hidden text-ellipsis'>
            {og.description}
          </span>
        </span>
        <img src={og.image} className='my-0 !important w-1/3 object-cover rounded-r-sm' />
      </a>
    )
  );
};
