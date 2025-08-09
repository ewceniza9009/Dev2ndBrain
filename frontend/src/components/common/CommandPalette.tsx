import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Tab } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { searchService } from '../../services/searchService';
import type { SearchResult } from 'minisearch';
import clsx from 'clsx';
import { debounce } from 'lodash-es';
import {
  PlusIcon, CodeBracketSquareIcon, RectangleStackIcon, BookOpenIcon,
  Squares2X2Icon, ShareIcon, Cog8ToothIcon, FolderOpenIcon
} from '@heroicons/react/20/solid';

interface Command {
  id: string;
  type: 'action' | 'navigation' | 'search';
  title: string;
  category: string;
  action: () => void;
  icon: JSX.Element;
  tags?: string[];
}

const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, toggleCommandPalette, tabs, setActiveTab, openTab } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const listRef = useRef<HTMLUListElement>(null);

  const { addNote } = useNoteStore();
  const { addSnippet } = useSnippetStore();
  const { addDeck } = useFlashcardStore();
  const { addProject } = useProjectStore(); // Get addProject action

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

  const handleCreateProject = useCallback(async () => {
    const newProject = await addProject({ title: 'New Project', description: '', goals: [], nextSteps: [], features: [], resources: [], history: [] });
    if (newProject?.id) navigate('/projects', { state: { selectedId: newProject.id }});
    toggleCommandPalette();
  }, [addProject, navigate, toggleCommandPalette]);

  const coreCommands: Command[] = useMemo(() => [
    { id: 'nav-dashboard', type: 'navigation', title: 'Go to Dashboard', category: 'Navigation', action: () => { setActiveTab(null); navigate('/'); toggleCommandPalette(); }, icon: <Squares2X2Icon className="h-5 w-5" /> },
    { id: 'nav-notes', type: 'navigation', title: 'Go to Notes', category: 'Navigation', action: () => { setActiveTab(null); navigate('/notes'); toggleCommandPalette(); }, icon: <BookOpenIcon className="h-5 w-5" /> },
    { id: 'nav-snippets', type: 'navigation', title: 'Go to Snippets', category: 'Navigation', action: () => { setActiveTab(null); navigate('/snippets'); toggleCommandPalette(); }, icon: <CodeBracketSquareIcon className="h-5 w-5" /> },
    { id: 'nav-projects', type: 'navigation', title: 'Go to Projects', category: 'Navigation', action: () => { setActiveTab(null); navigate('/projects'); toggleCommandPalette(); }, icon: <FolderOpenIcon className="h-5 w-5" /> },
    { id: 'nav-flashcards', type: 'navigation', title: 'Go to Flashcards', category: 'Navigation', action: () => { setActiveTab(null); navigate('/flashcards'); toggleCommandPalette(); }, icon: <RectangleStackIcon className="h-5 w-5" /> },
    { id: 'nav-graph', type: 'navigation', title: 'Go to Graph', category: 'Navigation', action: () => { setActiveTab(null); navigate('/graph'); toggleCommandPalette(); }, icon: <ShareIcon className="h-5 w-5" /> },
    { id: 'nav-settings', type: 'navigation', title: 'Go to Settings', category: 'Navigation', action: () => { setActiveTab(null); navigate('/settings'); toggleCommandPalette(); }, icon: <Cog8ToothIcon className="h-5 w-5" /> },
    { id: 'action-create-note', type: 'action', title: 'Create New Note', category: 'Actions', action: handleCreateNote, icon: <PlusIcon className="h-5 w-5" /> },
    { id: 'action-create-snippet', type: 'action', title: 'Create New Snippet', category: 'Actions', action: handleCreateSnippet, icon: <PlusIcon className="h-5 w-5" /> },
    { id: 'action-create-deck', type: 'action', title: 'Create New Deck', category: 'Actions', action: handleCreateDeck, icon: <PlusIcon className="h-5 w-5" /> },
    { id: 'action-create-project', type: 'action', title: 'Create New Project', category: 'Actions', action: handleCreateProject, icon: <PlusIcon className="h-5 w-5" /> },
  ], [navigate, handleCreateNote, handleCreateSnippet, handleCreateDeck, handleCreateProject, toggleCommandPalette, setActiveTab]);

  const debouncedSearch = useMemo(() => debounce((searchQuery: string) => {
    if (searchQuery.length > 1) {
      setSearchResults(searchService.search(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, 300), []);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const filteredCommands = useMemo(() => {
    if (!query) return coreCommands;
    return coreCommands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, coreCommands]);
  
  const allResults: Command[] = useMemo(() => {
    const tabResults: Command[] = query ? tabs
      .filter(tab => tab.title.toLowerCase().includes(query.toLowerCase()))
      .map(tab => ({
        id: `tab-${tab.id}`,
        type: 'search',
        title: tab.title,
        category: 'Open Tab',
        action: () => {
          setActiveTab(tab.id);
          toggleCommandPalette();
        },
        icon: <FolderOpenIcon className="h-5 w-5" />,
      })) : [];

    const searchItems: Command[] = searchResults.slice(0, 10).map((result) => {
        const type = result.type as 'note' | 'snippet' | 'flashcard' | 'project';
        const numericId = parseInt(result.id.split('-')[1], 10);
        let category: string;
        let icon: JSX.Element;
        let tabInfo: Omit<Tab, 'id'>;

        switch (type) {
          case 'note':
            category = 'Notes';
            icon = <BookOpenIcon className="h-5 w-5" />;
            tabInfo = { type: 'note', entityId: numericId, title: result.title };
            break;
          case 'snippet':
            category = 'Snippets';
            icon = <CodeBracketSquareIcon className="h-5 w-5" />;
            tabInfo = { type: 'snippet', entityId: numericId, title: result.title };
            break;
          case 'flashcard':
            category = 'Flashcards';
            icon = <RectangleStackIcon className="h-5 w-5" />;
            tabInfo = { type: 'deck', entityId: result.deckId, title: result.title };
            break;
          case 'project':
            category = 'Projects';
            icon = <FolderOpenIcon className="h-5 w-5" />;
            tabInfo = { type: 'project', entityId: numericId, title: result.title };
            break;
          default:
            return null as any;
        }

        return {
            id: result.id,
            type: 'search',
            title: result.title,
            category,
            action: () => {
                openTab(tabInfo);
                toggleCommandPalette();
            },
            icon,
            tags: result.tags
        };
      });
    return [...tabResults, ...filteredCommands, ...searchItems].filter(Boolean);
  }, [filteredCommands, searchResults, toggleCommandPalette, tabs, openTab, query, setActiveTab]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSearchResults([]);
      setActiveIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const handleResultClick = (item: Command) => {
    item.action();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (allResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allResults.length) % (allResults.length || 1));
      } else if (e.key === 'Enter' && allResults.length > 0) {
        e.preventDefault();
        handleResultClick(allResults[activeIndex]);
      } else if (e.key === 'Escape') {
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, allResults, activeIndex, toggleCommandPalette, navigate]);
  
  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

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
        <ul ref={listRef} className="max-h-96 overflow-y-auto p-2">
          {allResults.length > 0 ? (
            allResults.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleResultClick(item)}
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