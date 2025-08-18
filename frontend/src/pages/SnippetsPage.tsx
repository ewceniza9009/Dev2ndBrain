import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnippetStore } from '../stores/useSnippetStore';
import SnippetList, { type SnippetListHandle } from '../components/snippets/SnippetList';
import SnippetDetail from '../components/snippets/SnippetDetail';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { debounce } from 'lodash-es';

const SnippetsPage: React.FC = () => {
  const { addSnippet } = useSnippetStore();
  const [selectedSnippetId, setSelectedSnippetId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [filterTerm, setFilterTerm] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const snippetListRef = useRef<SnippetListHandle>(null);

  const debouncedSetFilter = useMemo(() => debounce(setDebouncedFilter, 300), []);

  useEffect(() => {
    debouncedSetFilter(filterTerm);
  }, [filterTerm, debouncedSetFilter]);

  const snippets = useLiveQuery(
    () => {
      const lowerFilter = debouncedFilter.toLowerCase();
      return db.snippets.filter(snippet => {
        if (snippet.isDeleted) return false;
        if (!lowerFilter) return true;
        return snippet.title.toLowerCase().includes(lowerFilter) ||
               snippet.code.toLowerCase().includes(lowerFilter) ||
               snippet.tags.some(tag => tag.toLowerCase().includes(lowerFilter));
      }).toArray();
    },
    [debouncedFilter]
  ) || [];

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedSnippetId(location.state.selectedId);
      navigate(location.pathname, { replace: true });
    } else if (!selectedSnippetId && snippets.length > 0) {
      setSelectedSnippetId(snippets[0].id!);
    } else if (selectedSnippetId && !snippets.some(s => s.id === selectedSnippetId)) {
      setSelectedSnippetId(snippets.length > 0 ? snippets[0].id! : null);
    }
  }, [snippets, selectedSnippetId, location.state, navigate]);
  
  const handleNewSnippet = async () => {
    const newSnippet = await addSnippet({
      title: "New Snippet",
      language: "plaintext",
      code: "",
      tags: []
    });
    if (newSnippet) {
      setSelectedSnippetId(newSnippet.id!);
    }
  }

  const selectedSnippet = useLiveQuery(
    () => selectedSnippetId ? db.snippets.get(selectedSnippetId) : undefined,
    [selectedSnippetId],
  ) ?? null;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilterTerm = e.target.value;
    setFilterTerm(newFilterTerm);
    if (newFilterTerm) {
      snippetListRef.current?.expandAll();
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Snippets</h2>
            <button
              onClick={handleNewSnippet}
              className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter snippets..."
              value={filterTerm}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <SnippetList
          ref={snippetListRef}
          snippets={snippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={setSelectedSnippetId}
        />
      </div>
      <div className="w-3/4">
        <SnippetDetail snippet={selectedSnippet} />
      </div>
    </div>
  );
};

export default SnippetsPage;