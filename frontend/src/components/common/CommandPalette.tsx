import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { searchService } from '../../services/searchService';
import type { SearchResult } from 'minisearch';
import clsx from 'clsx';
import { 
  PlusIcon, CodeBracketSquareIcon, RectangleStackIcon, BookOpenIcon,
  Squares2X2Icon, ShareIcon, Cog8ToothIcon
} from '@heroicons/react/20/solid';

interface Command {
  id: string;
  type: 'action' | 'navigation' | 'search';
  title: string;
  category: string;
  action: () => void;
  icon: JSX.Element;
}

const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, toggleCommandPalette } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { addNote } = useNoteStore();
  const { addSnippet } = useSnippetStore();
  const { addDeck } = useFlashcardStore();

  const handleCreateNote = useCallback(async () => {
    const newNote = await addNote({ title: 'Untitled Note', content: '', tags: [] });
    if (newNote?.id) navigate('/notes', { state: { selectedId: newNote.id } });
    toggleCommandPalette();
  }, [addNote, navigate, toggleCommandPalette]);

  const handleCreateSnippet = useCallback(async () => {
    const newSnippet = await addSnippet({ title: 'New Snippet', language: 'plaintext', code: '', tags: [] });
    if (newSnippet?.id) navigate('/snippets', { state: { selectedId: newSnippet.id } });
    toggleCommandPalette();
  }, [addSnippet, navigate, toggleCommandPalette]);
  
  const handleCreateDeck = useCallback(async () => {
    const name = prompt("Enter new deck name:");
    if (name) {
      const newDeck = await addDeck(name);
      if(newDeck?.id) navigate('/flashcards');
      toggleCommandPalette();
    }
  }, [addDeck, navigate, toggleCommandPalette]);

  const coreCommands: Command[] = useMemo(() => [
    { id: 'nav-dashboard', type: 'navigation', title: 'Go to Dashboard', category: 'Navigation', action: () => navigate('/'), icon: <Squares2X2Icon className="h-5 w-5" /> },
    { id: 'nav-notes', type: 'navigation', title: 'Go to Notes', category: 'Navigation', action: () => navigate('/notes'), icon: <BookOpenIcon className="h-5 w-5" /> },
    { id: 'nav-snippets', type: 'navigation', title: 'Go to Snippets', category: 'Navigation', action: () => navigate('/snippets'), icon: <CodeBracketSquareIcon className="h-5 w-5" /> },
    { id: 'nav-flashcards', type: 'navigation', title: 'Go to Flashcards', category: 'Navigation', action: () => navigate('/flashcards'), icon: <RectangleStackIcon className="h-5 w-5" /> },
    { id: 'nav-graph', type: 'navigation', title: 'Go to Graph', category: 'Navigation', action: () => navigate('/graph'), icon: <ShareIcon className="h-5 w-5" /> },
    { id: 'nav-settings', type: 'navigation', title: 'Go to Settings', category: 'Navigation', action: () => navigate('/settings'), icon: <Cog8ToothIcon className="h-5 w-5" /> },
    { id: 'action-create-note', type: 'action', title: 'Create New Note', category: 'Actions', action: handleCreateNote, icon: <PlusIcon className="h-5 w-5" /> },
    { id: 'action-create-snippet', type: 'action', title: 'Create New Snippet', category: 'Actions', action: handleCreateSnippet, icon: <PlusIcon className="h-5 w-5" /> },
    { id: 'action-create-deck', type: 'action', title: 'Create New Deck', category: 'Actions', action: handleCreateDeck, icon: <PlusIcon className="h-5 w-5" /> },
  ], [navigate, handleCreateNote, handleCreateSnippet, handleCreateDeck]);

  useEffect(() => {
    if (query.length > 1) {
      setSearchResults(searchService.search(query));
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const filteredCommands = useMemo(() => {
    if (!query) return coreCommands;
    return coreCommands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, coreCommands]);
  
  const allResults: Command[] = useMemo(() => {
    const searchItems: Command[] = searchResults.slice(0, 10).map(result => {
        const [type, id] = result.id.split('-');
        const numericId = parseInt(id, 10);
        return {
            id: result.id,
            type: 'search',
            title: result.title,
            category: type === 'note' ? 'Notes' : 'Snippets',
            action: () => {
                navigate(type === 'note' ? '/notes' : '/snippets', { state: { selectedId: numericId } });
                toggleCommandPalette();
            },
            icon: type === 'note' ? <BookOpenIcon className="h-5 w-5" /> : <CodeBracketSquareIcon className="h-5 w-5" />,
        };
    });
    return [...filteredCommands, ...searchItems];
  }, [filteredCommands, searchResults, navigate, toggleCommandPalette]);


  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSearchResults([]);
      setActiveIndex(0);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults.length > 0) {
            const selectedResult = allResults[activeIndex];
            if (selectedResult) {
                selectedResult.action();
            }
        }
      } else if (e.key === 'Escape') {
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, allResults, activeIndex, toggleCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black bg-opacity-50" onClick={toggleCommandPalette}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-2">
            <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full p-3 text-lg bg-transparent text-gray-900 dark:text-white focus:outline-none"
            />
        </div>
        <hr className="border-gray-200 dark:border-gray-700"/>
        <ul className="max-h-96 overflow-y-auto p-2">
          {allResults.length > 0 ? (
            allResults.map((item, index) => (
              <li
                key={item.id}
                onClick={item.action}
                className={clsx(
                  "p-3 flex justify-between items-center rounded-lg cursor-pointer transition-colors duration-150",
                  { 'bg-teal-600 text-white': index === activeIndex },
                  { 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': index !== activeIndex }
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className={clsx(index !== activeIndex && "text-gray-500")}>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <span className={clsx(
                  "text-xs px-2 py-1 rounded-full",
                  { 'bg-teal-700 text-white': index === activeIndex },
                  { 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200': index !== activeIndex }
                )}>
                  {item.category}
                </span>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;