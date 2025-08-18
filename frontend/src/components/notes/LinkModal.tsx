import React, { useState } from 'react';
import type { Note } from '../../types';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSelectNote }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useLiveQuery(
    () => {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      if (!lowerSearchTerm) {
    
        return db.notes
          .orderBy('updatedAt')
          .reverse()
          .filter(note => !note.isDeleted)
          .limit(20)
          .toArray();
      }

      return db.notes
        .filter(note => 
          !note.isDeleted && note.title.toLowerCase().includes(lowerSearchTerm)
        ).toArray();
    },
    [searchTerm]
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Link to Note</h2>
        <input
          type="text"
          placeholder="Search for a note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
          autoFocus
        />
        <ul className="max-h-64 overflow-y-auto">
          {filteredNotes.map((note: Note) => (
            <li
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-teal-700 rounded cursor-pointer"
            >
              {note.title}
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose} 
          className="mt-4 flex items-center justify-center space-x-1 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <XMarkIcon className="h-5 w-5" />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};

export default LinkModal;