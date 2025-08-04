// frontend/src/components/notes/NoteViewer.tsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Note } from '../../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import linkPlugin from '../../lib/linkPlugin';
import DLink from './DLink';
import { useNavigate } from 'react-router-dom';

const NoteViewer: React.FC<{ note: Note, fromGraph?: boolean }> = ({ note, fromGraph }) => {
  const navigate = useNavigate();

  const handleBackToGraph = () => {
    navigate('/graph');
  };
  
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

      {fromGraph && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button onClick={handleBackToGraph} className="text-blue-500 hover:underline">
            ← Back to Graph
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteViewer;