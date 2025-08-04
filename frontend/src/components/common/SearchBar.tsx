import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import type { SearchResult } from 'minisearch';
import clsx from 'clsx';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      const searchResults = searchService.search(newQuery);
      setResults(searchResults);
      setActiveIndex(0);
    } else {
      setResults([]);
      setActiveIndex(-1);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const [type, id] = result.id.split('-');
    const numericId = parseInt(id, 10);

    if (type === 'note') {
      navigate('/notes', { state: { selectedId: numericId } });
    } else if (type === 'snippet') {
      navigate('/snippets', { state: { selectedId: numericId } });
    } else if (type === 'flashcard') {
      // MODIFIED: Pass the deckId to the flashcard page
      navigate('/flashcards', { state: { selectedDeckId: result.deckId } });
    }
    
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(prevIndex => (prevIndex + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(prevIndex => (prevIndex - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
          e.preventDefault();
          const selectedResult = results[activeIndex];
          handleResultClick(selectedResult);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setResults([]);
          setQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [results, activeIndex]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search notes and snippets..."
        className="w-full px-4 py-2 text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      {results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
          {results.slice(0, 10).map((result, index) => (
            <li
              key={result.id}
              onClick={() => handleResultClick(result)}
              className={clsx(
                "px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200",
                index === activeIndex
                  ? "bg-teal-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-teal-700"
              )}
            >
              <span className="font-bold">{result.title}</span>
              <span className={clsx(
                "ml-2 text-xs uppercase",
                index === activeIndex ? "text-white" : "text-gray-500 dark:text-gray-400"
              )}
              >
                {result.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;