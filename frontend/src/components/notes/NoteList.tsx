import React from 'react';
import type { Note } from '../../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
  onNewNote: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Notes</h2>
        <button
          onClick={onNewNote}
          className="px-3 py-1 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
        >
          New
        </button>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {notes.map((note) => (
          <li key={note.id}>
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
      </ul>
    </div>
  );
};

export default NoteList;