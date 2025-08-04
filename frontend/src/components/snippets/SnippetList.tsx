import React, { useState, useRef, useEffect } from 'react';
import type { Snippet } from '../../types';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ChevronRightIcon, PlusIcon, ArrowDownOnSquareStackIcon } from '@heroicons/react/20/solid';

interface SnippetListProps {
  snippets: Snippet[];
  selectedSnippetId: number | null;
  onSelectSnippet: (id: number) => void;
  onNewSnippet: () => void;
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
        if (!grouped[language][tag]) {
          grouped[language][tag] = [];
        }
        grouped[language][tag].push(snippet);
      });
    } else {
      grouped[language]['Snippets without Tags'].push(snippet);
    }
  });

  return grouped;
};

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
  onNewSnippet,
}) => {
  const { importFromGists } = useSnippetStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const grouped = groupSnippets(snippets);
  const sortedLanguages = Object.keys(grouped).sort();

  const [collapsedLanguages, setCollapsedLanguages] = useState<string[]>([]);
  const [collapsedTags, setCollapsedTags] = useState<{ [lang: string]: string[] }>({});
  const snippetRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});

  const toggleLanguageCollapse = (lang: string) => {
    setCollapsedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleTagCollapse = (lang: string, tag: string) => {
    setCollapsedTags(prev => {
      const newTags = { ...prev };
      if (!newTags[lang]) {
        newTags[lang] = [];
      }
      newTags[lang] = newTags[lang].includes(tag) ? newTags[lang].filter(t => t !== tag) : [...newTags[lang], tag];
      return newTags;
    });
  };

  useEffect(() => {
    if (selectedSnippetId && snippetRefs.current[selectedSnippetId]) {
      snippetRefs.current[selectedSnippetId]?.scrollIntoView({
        behavior: 'smooth',
        // FIX: Changed 'center' to 'nearest' to prevent scrolling if the item is already visible.
        block: 'nearest',
      });
    }
  }, [selectedSnippetId]);

  const renderSnippetItem = (snippet: Snippet) => (
    <li
      key={snippet.id}
      ref={el => snippetRefs.current[snippet.id!] = el}
    >
      <button
        onClick={() => onSelectSnippet(snippet.id!)}
        className={`w-full text-left p-4 border-l-4 ${
          selectedSnippetId === snippet.id
            ? 'bg-gray-200 dark:bg-gray-700 border-teal-500'
            : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{snippet.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{snippet.language}</p>
      </button>
    </li>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={onNewSnippet}
          className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Snippet</span>
        </button>
        {isAuthenticated && (
          <button
            onClick={importFromGists}
            className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowDownOnSquareStackIcon className="h-5 w-5" />
            <span>Import from Gists</span>
          </button>
        )}
      </div>
      <ul className="flex-grow overflow-y-auto">
        {sortedLanguages.map(language => {
          const isLanguageCollapsed = collapsedLanguages.includes(language);
          const sortedTags = Object.keys(grouped[language]).sort();
          
          return (
            <React.Fragment key={language}>
              <h2
                onClick={() => toggleLanguageCollapse(language)}
                className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span>{language === 'Other' ? 'Other / No Language' : language}</span>
                <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${isLanguageCollapsed ? '' : 'rotate-90'}`} />
              </h2>
              {!isLanguageCollapsed && sortedTags.map(tag => {
                const snippetsInGroup = grouped[language][tag];
                if (snippetsInGroup.length === 0) return null;
                const isTagCollapsed = collapsedTags[language]?.includes(tag);

                return (
                  <React.Fragment key={tag}>
                    <h3
                      onClick={() => toggleTagCollapse(language, tag)}
                      className="flex justify-between items-center px-6 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 sticky top-8 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
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
};

export default SnippetList;