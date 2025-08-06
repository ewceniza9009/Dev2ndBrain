import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import type { SearchResult } from 'minisearch';
import clsx from 'clsx';
import { useAppStore } from '../../stores/useAppStore';

// A new interface to represent the combined search results
interface CombinedSearchResult extends Partial<SearchResult> {
  id: string;
  title: string;
  type: 'note' | 'snippet' | 'flashcard' | 'open-tab';
  deckId?: number;
  tabId?: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CombinedSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const { tabs, setActiveTab } = useAppStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 1) {
      const searchResults = searchService.search(newQuery);
      const tabResults: CombinedSearchResult[] = tabs
        .filter(tab => tab.title.toLowerCase().includes(newQuery.toLowerCase()))
        .map(tab => ({
          id: `tab-${tab.id}`,
          title: tab.title,
          type: 'open-tab',
          tabId: tab.id,
        }));
      
      // Explicitly map minisearch results to the CombinedSearchResult type
      const minisearchResults: CombinedSearchResult[] = searchResults.map(r => ({
        ...r,
        id: r.id,
        title: r.title,
        type: r.type as 'note' | 'snippet' | 'flashcard',
      }));

      const combined = [...tabResults, ...minisearchResults];
      setResults(combined);
      setActiveIndex(0);
    } else {
      setResults([]);
      setActiveIndex(-1);
    }
  };

  const handleResultClick = (result: CombinedSearchResult) => {
    if (result.type === 'open-tab' && result.tabId) {
      setActiveTab(result.tabId);
    } else {
      setActiveTab(null);
      const [type, id] = result.id.split('-');
      const numericId = parseInt(id, 10);

      if (type === 'note') {
        navigate('/notes', { state: { selectedId: numericId } });
      } else if (type === 'snippet') {
        navigate('/snippets', { state: { selectedId: numericId } });
      } else if (type === 'flashcard') {
        navigate('/flashcards', { state: { selectedDeckId: result.deckId } });
      }
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
          handleResultClick(results[activeIndex]);
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
        placeholder="Search notes, snippets, decks, and open tabs..."
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
                {result.type.replace('-', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;