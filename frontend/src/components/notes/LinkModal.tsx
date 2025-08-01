import React, { useState } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSelectNote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const notes = useNoteStore((state) => state.notes);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Link to Note</h2>
        <input
          type="text"
          placeholder="Search for a note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
        />
        <ul className="max-h-64 overflow-y-auto">
          {filteredNotes.map(note => (
            <li
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-teal-700 rounded cursor-pointer"
            >
              {note.title}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 dark:bg-gray-600 rounded text-white w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default LinkModal;