import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../../types';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
  onNewNote: () => void;
}

const groupNotesByTag = (notes: Note[]) => {
  const grouped: { [tag: string]: Note[] } = {
    'Notes without Tags': []
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
  const groupedNotes = groupNotesByTag(notes);
  const sortedTags = Object.keys(groupedNotes).sort();

  const [collapsedTags, setCollapsedTags] = useState<string[]>([]);
  const noteRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});

  const toggleCollapse = (tag: string) => {
    setCollapsedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    if (selectedNoteId && noteRefs.current[selectedNoteId]) {
      noteRefs.current[selectedNoteId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedNoteId]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <ul className="flex-grow overflow-y-auto">
        {sortedTags.map((tag) => {
          const notesInGroup = groupedNotes[tag];
          if (notesInGroup.length === 0) {
            return null;
          }

          const isCollapsed = collapsedTags.includes(tag);

          return (
            <React.Fragment key={tag}>
              <h2
                onClick={() => toggleCollapse(tag)}
                className="flex justify-between items-center px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                <ChevronRightIcon className={`h-5 w-5 transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
              </h2>
              {!isCollapsed && notesInGroup.map((note) => (
                <li
                  key={note.id}
                  ref={el => noteRefs.current[note.id!] = el}
                >
                  <button
                    onClick={() => onSelectNote(note.id!)}
                    className={`w-full text-left p-4 border-l-4 ${
                      selectedNoteId === note.id
                        ? 'bg-gray-200 dark:bg-gray-700 border-teal-500'
                        : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Updated: {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
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