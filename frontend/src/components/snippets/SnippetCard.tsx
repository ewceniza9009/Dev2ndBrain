import React from 'react';
import type { Snippet } from '../../types';
import Editor from '@monaco-editor/react';

interface SnippetCardProps {
  snippet: Snippet;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      <h3 className="text-xl font-bold text-purple-400 mb-2">{snippet.title}</h3>
      <div className="text-sm text-gray-400 mb-2">Language: {snippet.language}</div>
      <div className="rounded-md overflow-hidden h-64">
        <Editor
          height="100%"
          language={snippet.language}
          value={snippet.code}
          theme="vs-dark"
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
      <div className="mt-2">
        {snippet.tags.map(tag => (
          <span key={tag} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SnippetCard;