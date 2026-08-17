import { StaticImageData } from 'next/image';
import peekADotPreview from './assets/peek-a-dot.jpg';

export interface Project {
  name: string;
  href: string;
  previewImage: StaticImageData;
}

export const projects: Project[] = [
  {
    name: 'Peek A Dot',
    href: 'https://d1y8phpwyhe1jr.cloudfront.net',
    previewImage: peekADotPreview,
  },
];
