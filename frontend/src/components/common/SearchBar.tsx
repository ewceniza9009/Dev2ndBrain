import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import type { SearchResult } from 'minisearch';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      const searchResults = searchService.search(newQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const [type, id] = result.id.split('-');
    const numericId = parseInt(id, 10);

    if (type === 'note') {
      navigate('/notes', { state: { selectedId: numericId } });
    } else if (type === 'snippet') {
      navigate('/snippets', { state: { selectedId: numericId } });
    }
    
    setQuery('');
    setResults([]);
  };

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
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
          {results.slice(0, 10).map(result => (
            <li
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-teal-700 text-gray-800 dark:text-gray-200"
            >
              <span className="font-bold">{result.title}</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 uppercase">{result.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;