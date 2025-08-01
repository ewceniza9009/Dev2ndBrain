import React from 'react';
import type { Snippet } from '../../types';

interface SnippetListProps {
  snippets: Snippet[];
  selectedSnippetId: number | null;
  onSelectSnippet: (id: number) => void;
  onNewSnippet: () => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
  onNewSnippet,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewSnippet}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
        >
          New Snippet
        </button>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {snippets.map((snippet) => (
          <li key={snippet.id}>
            <button
              onClick={() => onSelectSnippet(snippet.id!)}
              className={`w-full text-left p-4 border-l-4 ${
                selectedSnippetId === snippet.id
                  ? 'bg-gray-200 dark:bg-gray-700 border-teal-500'
                  : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{snippet.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{snippet.language}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SnippetList;