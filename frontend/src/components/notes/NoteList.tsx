import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
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
  onNewNote: () => void;
}

const groupNotesByTag = (notes: Note[]) => {
  const grouped: { [tag: string]: Note[] } = {
    'Notes without Tags': [],
  };

  notes.forEach(note => {
    if (note.tags && note.tags.length > 0) {
      note.tags.forEach(tag => {
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(note);
      });
    } else {
      grouped['Notes without Tags'].push(note);
    }
  });

  return grouped;
};

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
}) => {
  const { openTab } = useAppStore();
  const groupedNotes = groupNotesByTag(notes);
  const sortedTags = Object.keys(groupedNotes).filter(tag => groupedNotes[tag].length > 0);

  const [collapsedTags, setCollapsedTags] = useState<string[]>(() => {
    const saved = localStorage.getItem(COLLAPSED_TAGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const noteRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});

  useEffect(() => {
    localStorage.setItem(COLLAPSED_TAGS_STORAGE_KEY, JSON.stringify(collapsedTags));
  }, [collapsedTags]);

  const allAreCollapsed = sortedTags.length > 0 && collapsedTags.length === sortedTags.length;

  const toggleAll = () => {
    if (allAreCollapsed) {
      setCollapsedTags([]);
    } else {
      setCollapsedTags(sortedTags);
    }
  };
  
  const toggleCollapse = (tag: string) => {
    setCollapsedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    if (selectedNoteId && noteRefs.current[selectedNoteId]) {
      noteRefs.current[selectedNoteId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedNoteId]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-2 flex items-center justify-start border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleAll}
          className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="mr-1">Expand/Collapse</span>
          {allAreCollapsed ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
        </button>
      </div>

      <ul className="flex-grow overflow-y-auto">
        {sortedTags.map((tag) => {
          const notesInGroup = groupedNotes[tag];
          const isCollapsed = collapsedTags.includes(tag);
          return (
            <React.Fragment key={tag}>
              <h2 onClick={() => toggleCollapse(tag)} className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 min-w-0 truncate">
                <span className="min-w-0 truncate">{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
              </h2>
              {!isCollapsed && notesInGroup.map((note) => (
                <li key={note.id} ref={el => (noteRefs.current[note.id!] = el)}>
                  <div className="flex items-center justify-between w-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <button onClick={() => onSelectNote(note.id!)} className={`flex-grow text-left p-4 border-l-4 ${selectedNoteId === note.id ? 'bg-gray-200 dark:bg-gray-700 border-teal-500' : 'border-transparent'}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => openTab({ type: 'note', entityId: note.id!, title: note.title })} className="p-2 mr-2 text-gray-500 hover:text-teal-500" title="Open in new tab">
                      <FolderOpenIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default NoteList;