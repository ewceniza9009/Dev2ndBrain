import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note } from '../../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../../stores/useNoteStore';
import linkPlugin from '../../lib/linkPlugin'; // Import the custom remark plugin

interface NoteViewerProps {
  note: Note;
}

// Custom component to handle the [[uuid]] link
const DLink = ({ uuid }: { uuid: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.uuid === uuid));
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (note?.id) {
      navigate('/notes', { state: { selectedId: note.id } });
    }
  };

  const linkTitle = note ? note.title : `[[${uuid}]]`;

  return (
    <a href="#" onClick={handleClick} className="text-blue-500 hover:underline">
      {linkTitle}
    </a>
  );
};

const NoteViewer: React.FC<NoteViewerProps> = ({ note }) => {
  return (
    <div className="prose dark:prose-invert max-w-none p-4 overflow-y-auto h-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, linkPlugin]}
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
          // Map the custom 'd-link' node to our DLink component
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