import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnippetStore } from '../stores/useSnippetStore';
import SnippetList, { type SnippetListHandle } from '../components/snippets/SnippetList';
import SnippetDetail from '../components/snippets/SnippetDetail';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const SnippetsPage: React.FC = () => {
  const { snippets, fetchSnippets, addSnippet } = useSnippetStore();
  const [selectedSnippetId, setSelectedSnippetId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [filterTerm, setFilterTerm] = useState('');
  const snippetListRef = useRef<SnippetListHandle>(null);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedSnippetId(location.state.selectedId);
      navigate(location.pathname, { replace: true });
    }
    else if (!selectedSnippetId && snippets.length > 0) {
      setSelectedSnippetId(snippets[0].id!);
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

  const filteredSnippets = useMemo(() => {
    if (!filterTerm) return snippets;
    const lowercasedFilter = filterTerm.toLowerCase();
    return snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(lowercasedFilter) ||
        snippet.code.toLowerCase().includes(lowercasedFilter)
    );
  }, [snippets, filterTerm]);

  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId) || null;

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newFilterTerm = (e.target as HTMLInputElement).value;
      setFilterTerm(newFilterTerm);
      if (newFilterTerm) {
        snippetListRef.current?.expandAll();
      }
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
                    placeholder="Filter snippets and press Enter..."
                    onKeyDown={handleFilterKeyDown}
                    className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
        <SnippetList
          ref={snippetListRef}
          snippets={filteredSnippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={setSelectedSnippetId}
          onNewSnippet={handleNewSnippet}
        />
      </div>
      <div className="w-3/4">
        <SnippetDetail snippet={selectedSnippet} />
      </div>
    </div>
  );
};

export default SnippetsPage;