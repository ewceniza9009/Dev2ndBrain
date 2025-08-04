import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnippetStore } from '../stores/useSnippetStore';
import SnippetList from '../components/snippets/SnippetList';
import SnippetDetail from '../components/snippets/SnippetDetail';
import { PlusIcon } from '@heroicons/react/20/solid';

const SnippetsPage: React.FC = () => {
  const { snippets, fetchSnippets, addSnippet } = useSnippetStore();
  const [selectedSnippetId, setSelectedSnippetId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId) || null;

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Snippets</h2>
            <button
                onClick={handleNewSnippet}
                className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
                <PlusIcon className="h-4 w-4" />
                <span>New</span>
            </button>
        </div>
        <SnippetList
          snippets={snippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={setSelectedSnippetId}
          onNewSnippet={handleNewSnippet}
        />
      </div>
      <div className="w-2/3">
        <SnippetDetail snippet={selectedSnippet} />
      </div>
    </div>
  );
};

export default SnippetsPage;