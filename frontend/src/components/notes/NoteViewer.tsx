import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note } from '../../types';

interface NoteViewerProps {
  note: Note;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ note }) => {
  return (
    <div className="prose dark:prose-invert max-w-none p-4 overflow-y-auto h-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {note.content}
      </ReactMarkdown>
    </div>
  );
};

export default NoteViewer;