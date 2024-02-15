import Link from 'next/link';
import Image from 'next/image';
import { MDXComponents } from 'mdx/types';

export const mdxComponents: MDXComponents = {
  a: ({ children, ...props }) => {
    return (
      <Link {...props} href={props.href || ''}>
        {children}
      </Link>
    );
  },
  img: ({ children, props }) => {
    return <Image {...props} />;
  },
};
