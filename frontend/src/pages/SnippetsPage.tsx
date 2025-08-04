import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnippetStore } from '../stores/useSnippetStore';
import SnippetList from '../components/snippets/SnippetList';
import SnippetDetail from '../components/snippets/SnippetDetail';

const SnippetsPage: React.FC = () => {
  const { snippets, fetchSnippets, addSnippet } = useSnippetStore();
  const [selectedSnippetId, setSelectedSnippetId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate(); // Import useNavigate

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  useEffect(() => {
    // Check for an ID passed from the search bar
    if (location.state?.selectedId) {
      setSelectedSnippetId(location.state.selectedId);
      // MODIFIED: Clear the navigation state to prevent bug
      navigate(location.pathname, { replace: true });
    }
    // Otherwise, select the first snippet if none is selected
    else if (!selectedSnippetId && snippets.length > 0) {
      setSelectedSnippetId(snippets[0].id!);
    }
  }, [snippets, selectedSnippetId, location.state, navigate]); // MODIFIED: Add navigate to dependencies
  
  const handleNewSnippet = async () => {
    await addSnippet({
      title: "New Snippet",
      language: "plaintext",
      code: "",
      tags: []
    });
    const newSnippets = useSnippetStore.getState().snippets;
    const newSnippet = newSnippets[newSnippets.length - 1];
    if (newSnippet) {
      setSelectedSnippetId(newSnippet.id!);
    }
  }

  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId) || null;

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-700">
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