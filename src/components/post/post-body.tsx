import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import { mdxComponents } from './mdx-components';

export const PostBody = ({ content }: { content: string }) => {
  return (
    <article className='prose max-w-none prose-neutral prose-invert prose-sm md:prose-base'>
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm as any],
            rehypePlugins: [
              rehypeSlug as any,
              rehypeAutolinkHeadings as any,
              [rehypeRaw, { passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'] }] as any,
            ],
          },
        }}
        components={mdxComponents}
      />
    </article>
  );
};
