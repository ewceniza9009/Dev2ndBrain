import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Note } from '../../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import linkPlugin from '../../lib/linkPlugin';
import DLink from './DLink';
const NoteViewer: React.FC<{ note: Note }> = ({ note }) => {
  return (
    <div className="prose dark:prose-invert max-w-none p-4 overflow-y-auto h-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, linkPlugin]}
        rehypePlugins={[rehypeRaw]} 
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={darcula} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Map the custom link to our imported DLink component
          a: ({ href, children, ...props }) => {
            if (href && href.startsWith('uuid:')) {
              const uuid = href.replace('uuid:', '');
              return <DLink uuid={uuid} />;
            }
            return <a href={href} {...props}>{children}</a>;
          },
        }}
      >
        {note.content}
      </ReactMarkdown>
    </div>
  );
};

export default NoteViewer;