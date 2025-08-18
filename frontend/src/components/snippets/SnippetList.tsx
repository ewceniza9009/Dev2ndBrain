import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import type { Snippet } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ChevronRightIcon,
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
}

export interface SnippetListHandle {
  expandAll: () => void;
}

interface ListItem {
  type: 'language' | 'tag' | 'snippet';
  id: string;
  content: any;
}

const SnippetList = forwardRef<SnippetListHandle, SnippetListProps>(({ snippets, selectedSnippetId, onSelectSnippet }, ref) => {
  const { openTab } = useAppStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const [collapsedLanguages, setCollapsedLanguages] = useState<string[]>(() => JSON.parse(localStorage.getItem(COLLAPSED_LANGS_STORAGE_KEY) || '[]'));
  const [collapsedTags, setCollapsedTags] = useState<{ [lang: string]: string[] }>(() => JSON.parse(localStorage.getItem(COLLAPSED_TAGS_STORAGE_KEY) || '{}'));

  useEffect(() => localStorage.setItem(COLLAPSED_LANGS_STORAGE_KEY, JSON.stringify(collapsedLanguages)), [collapsedLanguages]);
  useEffect(() => localStorage.setItem(COLLAPSED_TAGS_STORAGE_KEY, JSON.stringify(collapsedTags)), [collapsedTags]);
  
  const { grouped, sortedLanguages } = useMemo(() => {
    const grouped: { [language: string]: { [tag: string]: Snippet[] } } = {};
    const fallbackLanguage = 'Other';

    snippets.forEach(snippet => {
      const language = snippet.language || fallbackLanguage;
      const hasTags = snippet.tags && snippet.tags.length > 0;
      if (!grouped[language]) {
        grouped[language] = { 'Untagged': [] };
      }
      if (hasTags) {
        snippet.tags.forEach(tag => {
          if (!grouped[language][tag]) grouped[language][tag] = [];
          grouped[language][tag].push(snippet);
        });
      } else {
        grouped[language]['Untagged'].push(snippet);
      }
    });
    return { grouped, sortedLanguages: Object.keys(grouped).sort() };
  }, [snippets]);

  const listItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    sortedLanguages.forEach(lang => {
      items.push({ type: 'language', id: `lang-${lang}`, content: lang });
      if (!collapsedLanguages.includes(lang)) {
        const sortedTags = Object.keys(grouped[lang]).sort();
        sortedTags.forEach(tag => {
          if (grouped[lang][tag].length > 0) {
            items.push({ type: 'tag', id: `tag-${lang}-${tag}`, content: { lang, tag } });
            if (!collapsedTags[lang]?.includes(tag)) {
              grouped[lang][tag].forEach(snippet => {
                items.push({ type: 'snippet', id: `snippet-${snippet.id}`, content: snippet });
              });
            }
          }
        });
      }
    });
    return items;
  }, [sortedLanguages, collapsedLanguages, collapsedTags, grouped]);

  const rowVirtualizer = useVirtualizer({
    count: listItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      switch(listItems[index].type) {
        case 'language': return 40;
        case 'tag': return 32;
        default: return 68; // snippet
      }
    },
    overscan: 5,
  });

  useImperativeHandle(ref, () => ({
    expandAll() {
      setCollapsedLanguages([]);
      setCollapsedTags({});
    }
  }));

  useEffect(() => {
    if (selectedSnippetId) {
      const index = listItems.findIndex(item => item.type === 'snippet' && item.content.id === selectedSnippetId);
      if (index !== -1) {
        rowVirtualizer.scrollToIndex(index, { align: 'center' });
      }
    }
  }, [selectedSnippetId, listItems]);

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

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-2 flex items-center justify-start border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button onClick={toggleAll} className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <span className="mr-1">Expand/Collapse</span>
          {allAreCollapsed ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
        </button>
      </div>
      <div ref={parentRef} className="flex-grow overflow-y-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = listItems[virtualItem.index];
            return (
              <div key={item.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualItem.start}px)` }}>
                {item.type === 'language' ? (
                  <h2 onClick={() => toggleLanguageCollapse(item.content)} className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span>{item.content === 'Other' ? 'Other / No Language' : item.content}</span>
                    <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${collapsedLanguages.includes(item.content) ? '' : 'rotate-90'}`} />
                  </h2>
                ) : item.type === 'tag' ? (
                  <h3 onClick={() => toggleTagCollapse(item.content.lang, item.content.tag)} className="flex justify-between items-center pl-5 pr-5 py-1 text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span>{item.content.tag.charAt(0).toUpperCase() + item.content.tag.slice(1)}</span>
                    <ChevronRightIcon className={`h-4 w-4 transform transition-transform duration-200 ${collapsedTags[item.content.lang]?.includes(item.content.tag) ? '' : 'rotate-90'}`} />
                  </h3>
                ) : (
                  <div className="flex items-center justify-between w-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <button onClick={() => onSelectSnippet(item.content.id!)} className={`flex-grow text-left p-2 border-l-4 ${selectedSnippetId === item.content.id ? 'bg-gray-200 pl-6 dark:bg-gray-700 border-teal-500' : 'border-transparent pl-5'}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.content.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.content.createdAt).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => openTab({ type: 'snippet', entityId: item.content.id!, title: item.content.title })} className="p-2 mr-2 text-gray-500 hover:text-teal-500" title="Open in new tab">
                      <FolderOpenIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SnippetList;