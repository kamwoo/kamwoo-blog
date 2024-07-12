import { MDXComponents } from 'mdx/types';
import { MDXCode } from './mdx-code';
import { MDXImage } from './mdx-image';
import { MDXOg } from './mdx-og';

export const mdxComponents: MDXComponents = {
  code: MDXCode,
  img: MDXImage,
  a: MDXOg,
};
