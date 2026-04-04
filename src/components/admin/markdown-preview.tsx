'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Props {
  content: string;
}

export function MarkdownPreview({ content }: Props) {
  return (
    <div className='h-full overflow-y-auto border-l border-border'>
      <article className='prose max-w-none prose-neutral prose-invert prose-sm md:prose-base p-4'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm as any]}
          rehypePlugins={[rehypeRaw as any]}
          remarkRehypeOptions={{ allowDangerousHtml: true }}
          components={{
            img: ({ node, ...props }) => <img {...props} />,
            video: ({ node, ...props }) => <video {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
