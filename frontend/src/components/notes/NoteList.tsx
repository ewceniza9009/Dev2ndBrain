import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import type { Note } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ChevronRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  FolderOpenIcon,
} from '@heroicons/react/20/solid';

const COLLAPSED_TAGS_STORAGE_KEY = 'noteApp.collapsedTags';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
}

export interface NoteListHandle {
  expandAll: () => void;
}

interface ListItem {
  type: 'tag' | 'note';
  id: string;
  content: any;
}

const NoteList = forwardRef<NoteListHandle, NoteListProps>(({ notes, selectedNoteId, onSelectNote }, ref) => {
  const { openTab } = useAppStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const [collapsedTags, setCollapsedTags] = useState<string[]>(() => {
    const saved = localStorage.getItem(COLLAPSED_TAGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSED_TAGS_STORAGE_KEY, JSON.stringify(collapsedTags));
  }, [collapsedTags]);

  const { groupedNotes, sortedTags } = useMemo(() => {
    const grouped: { [tag: string]: Note[] } = { 'Notes without Tags': [] };
    notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => {
          if (!grouped[tag]) grouped[tag] = [];
          grouped[tag].push(note);
        });
      } else {
        grouped['Notes without Tags'].push(note);
      }
    });
    const sorted = Object.keys(grouped).filter(tag => grouped[tag].length > 0).sort();
    return { groupedNotes: grouped, sortedTags: sorted };
  }, [notes]);
  
  const listItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    sortedTags.forEach(tag => {
      items.push({ type: 'tag', id: `tag-${tag}`, content: tag });
      if (!collapsedTags.includes(tag)) {
        groupedNotes[tag].forEach(note => {
          items.push({ type: 'note', id: `note-${note.id}`, content: note });
        });
      }
    });
    return items;
  }, [sortedTags, collapsedTags, groupedNotes]);

  useImperativeHandle(ref, () => ({
    expandAll: () => setCollapsedTags([]),
  }));

  const allAreCollapsed = sortedTags.length > 0 && collapsedTags.length === sortedTags.length;
  const toggleAll = () => setCollapsedTags(allAreCollapsed ? [] : sortedTags);
  const toggleCollapse = (tag: string) => setCollapsedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const rowVirtualizer = useVirtualizer({
    count: listItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => listItems[index].type === 'tag' ? 40 : 80,
    overscan: 5,
  });

  useEffect(() => {
    if (selectedNoteId) {
      const index = listItems.findIndex(item => item.type === 'note' && item.content.id === selectedNoteId);
      if (index !== -1) {
        rowVirtualizer.scrollToIndex(index, { align: 'center' });
      }
    }
  }, [selectedNoteId, listItems]);

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
                {item.type === 'tag' ? (
                  <h2 onClick={() => toggleCollapse(item.content)} className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 min-w-0 truncate">
                    <span className="min-w-0 truncate">{item.content.charAt(0).toUpperCase() + item.content.slice(1)}</span>
                    <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${collapsedTags.includes(item.content) ? '' : 'rotate-90'}`} />
                  </h2>
                ) : (
                  <div className="flex items-center justify-between w-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <button onClick={() => onSelectNote(item.content.id!)} className={`flex-grow text-left p-4 border-l-4 ${selectedNoteId === item.content.id ? 'bg-gray-200 dark:bg-gray-700 border-teal-500' : 'border-transparent'}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.content.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated: {new Date(item.content.updatedAt).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => openTab({ type: 'note', entityId: item.content.id!, title: item.content.title })} className="p-2 mr-2 text-gray-500 hover:text-teal-500" title="Open in new tab">
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

export default NoteList;