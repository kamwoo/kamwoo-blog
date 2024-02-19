// @ts-expect-error no types
import remarkA11yEmoji from '@fec/remark-a11y-emoji';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkToc from 'remark-toc';
import { mdxComponents } from './mdx-components';
import remarkFrontMatter from 'remark-frontmatter';

export const PostBody = ({ content }: { content: string }) => {
  return (
    <article className='prose max-w-none prose-neutral prose-invert prose-sm md:prose-base'>
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkA11yEmoji, remarkFrontMatter, remarkToc],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            pragmaImportSource: '@mdx-js/react',
          },
        }}
        components={mdxComponents}
      />
    </article>
  );
};
