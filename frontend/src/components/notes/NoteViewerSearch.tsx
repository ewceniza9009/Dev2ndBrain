import React, { useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface NoteViewerSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  matchCount: number;
  activeMatchIndex: number;
}

const NoteViewerSearch: React.FC<NoteViewerSearchProps> = ({
  query,
  onQueryChange,
  onNext,
  onPrevious,
  onClose,
  matchCount,
  activeMatchIndex,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevious();
      } else {
        onNext();
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 flex items-center space-x-2 border border-gray-300 dark:border-gray-600">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in note..."
        className="w-48 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {matchCount > 0 ? `${activeMatchIndex + 1} / ${matchCount}` : '0 / 0'}
      </span>
      <button onClick={onPrevious} disabled={matchCount === 0} className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
        <ChevronUpIcon className="h-5 w-5" />
      </button>
      <button onClick={onNext} disabled={matchCount === 0} className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
        <ChevronDownIcon className="h-5 w-5" />
      </button>
      <button onClick={onClose} className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default NoteViewerSearch;