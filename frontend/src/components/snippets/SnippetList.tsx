import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Snippet } from '../../types';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import {
  ChevronRightIcon,
  PlusIcon,
  ArrowDownOnSquareStackIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  FolderOpenIcon,
} from '@heroicons/react/20/solid';

const COLLAPSED_LANGS_STORAGE_KEY = 'snippetApp.collapsedLanguages';
const COLLAPSED_TAGS_STORAGE_KEY = 'snippetApp.collapsedTags';

interface SnippetListProps {
  snippets: Snippet[];
  selectedSnippetId: number | null;
  onSelectSnippet: (id: number) => void;
  onNewSnippet: () => void;
}

export interface SnippetListHandle {
  expandAll: () => void;
}

const groupSnippets = (snippets: Snippet[]) => {
  const grouped: { [language: string]: { [tag: string]: Snippet[] } } = {};
  const fallbackLanguage = 'Other';

  snippets.forEach(snippet => {
    const language = snippet.language || fallbackLanguage;
    const hasTags = snippet.tags && snippet.tags.length > 0;
    if (!grouped[language]) {
      grouped[language] = { 'Snippets without Tags': [] };
    }
    if (hasTags) {
      snippet.tags.forEach(tag => {
        if (!grouped[language][tag]) grouped[language][tag] = [];
        grouped[language][tag].push(snippet);
      });
    } else {
      grouped[language]['Snippets without Tags'].push(snippet);
    }
  });
  return grouped;
};

const SnippetList = forwardRef<SnippetListHandle, SnippetListProps>(({ snippets, selectedSnippetId, onSelectSnippet, onNewSnippet }, ref) => {
  const { importFromGists } = useSnippetStore();
  const { openTab } = useAppStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const grouped = groupSnippets(snippets);
  const sortedLanguages = Object.keys(grouped).sort();
  const snippetRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});
  const [collapsedLanguages, setCollapsedLanguages] = useState<string[]>(() => JSON.parse(localStorage.getItem(COLLAPSED_LANGS_STORAGE_KEY) || '[]'));
  const [collapsedTags, setCollapsedTags] = useState<{ [lang: string]: string[] }>(() => JSON.parse(localStorage.getItem(COLLAPSED_TAGS_STORAGE_KEY) || '{}'));

  useImperativeHandle(ref, () => ({
    expandAll() {
      setCollapsedLanguages([]);
      setCollapsedTags({});
    }
  }));

  useEffect(() => localStorage.setItem(COLLAPSED_LANGS_STORAGE_KEY, JSON.stringify(collapsedLanguages)), [collapsedLanguages]);
  useEffect(() => localStorage.setItem(COLLAPSED_TAGS_STORAGE_KEY, JSON.stringify(collapsedTags)), [collapsedTags]);

  useEffect(() => {
    if (selectedSnippetId && snippetRefs.current[selectedSnippetId]) {
      snippetRefs.current[selectedSnippetId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSnippetId]);

  const allAreCollapsed = sortedLanguages.length > 0 && collapsedLanguages.length === sortedLanguages.length;

  const toggleAll = () => {
    if (allAreCollapsed) {
      setCollapsedLanguages([]);
      setCollapsedTags({});
    } else {
      setCollapsedLanguages(sortedLanguages);
      const allTagsCollapsed: { [lang: string]: string[] } = {};
      sortedLanguages.forEach(lang => { allTagsCollapsed[lang] = Object.keys(grouped[lang]); });
      setCollapsedTags(allTagsCollapsed);
    }
  };

  const toggleLanguageCollapse = (lang: string) => setCollapsedLanguages(p => p.includes(lang) ? p.filter(l => l !== lang) : [...p, lang]);
  const toggleTagCollapse = (lang: string, tag: string) => setCollapsedTags(p => ({ ...p, [lang]: (p[lang] || []).includes(tag) ? (p[lang] || []).filter(t => t !== tag) : [...(p[lang] || []), tag] }));

  const renderSnippetItem = (snippet: Snippet) => (
    <li key={snippet.id} ref={el => snippetRefs.current[snippet.id!] = el}>
      <div className="flex items-center justify-between w-full hover:bg-gray-200 dark:hover:bg-gray-700">
        <button onClick={() => onSelectSnippet(snippet.id!)} className={`flex-grow text-left p-2 border-l-4 ${selectedSnippetId === snippet.id ? 'bg-gray-200 pl-6 dark:bg-gray-700 border-teal-500' : 'border-transparent pl-5'}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{snippet.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{snippet.createdAt.toLocaleString()}</p>
        </button>
        <button onClick={() => openTab({ type: 'snippet', entityId: snippet.id!, title: snippet.title })} className="p-2 mr-2 text-gray-500 hover:text-teal-500" title="Open in new tab">
          <FolderOpenIcon className="h-5 w-5" />
        </button>
      </div>
    </li>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <button onClick={onNewSnippet} className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200">
          <PlusIcon className="h-5 w-5" />
          <span>New Snippet</span>
        </button>
        {isAuthenticated && (
          <button onClick={importFromGists} className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200">
            <ArrowDownOnSquareStackIcon className="h-5 w-5" />
            <span>Import from Gists</span>
          </button>
        )}
      </div>
      <div className="px-4 py-2 flex items-center justify-start border-b border-gray-200 dark:border-gray-700">
        <button onClick={toggleAll} className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <span className="mr-1">Expand/Collapse</span>
          {allAreCollapsed ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
        </button>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {sortedLanguages.map(language => {
          const isLanguageCollapsed = collapsedLanguages.includes(language);
          const sortedTags = Object.keys(grouped[language]).sort();
          return (
            <React.Fragment key={language}>
              <h2 onClick={() => toggleLanguageCollapse(language)} className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-100 dark:bg-gray-800 z-20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                <span>{language === 'Other' ? 'Other / No Language' : language}</span>
                <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${isLanguageCollapsed ? '' : 'rotate-90'}`} />
              </h2>
              {!isLanguageCollapsed && sortedTags.map(tag => {
                const snippetsInGroup = grouped[language][tag];
                if (snippetsInGroup.length === 0) return null;
                const isTagCollapsed = collapsedTags[language]?.includes(tag);
                return (
                  <React.Fragment key={tag}>
                    <h3 onClick={() => toggleTagCollapse(language, tag)} className="flex justify-between items-center pl-5 pr-5 py-1 text-sm font-semibold text-gray-400 dark:text-gray-500 sticky top-10 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                      <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                      <ChevronRightIcon className={`h-4 w-4 transform transition-transform duration-200 ${isTagCollapsed ? '' : 'rotate-90'}`} />
                    </h3>
                    {!isTagCollapsed && snippetsInGroup.map(snippet => renderSnippetItem(snippet))}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
});

export default SnippetList;