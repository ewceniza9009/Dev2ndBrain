import React from 'react';
import type { Template } from '../../types';
import { PlusIcon } from '@heroicons/react/20/solid';

interface NewNoteModalProps {
  isOpen: boolean;
  templates: Template[];
  onClose: () => void;
  onSelect: (template?: Template) => void;
}

const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, templates, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Note</h2>
        
        <button 
          onClick={() => onSelect()} 
          className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">Start with a Blank Note</span>
        </button>

        <hr className="border-gray-300 dark:border-gray-600 my-4" />
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Or use a template:</h3>
        
        <ul className="max-h-64 overflow-y-auto">
          {templates.length > 0 ? templates.map(t => (
            <li
              key={t.id}
              onClick={() => onSelect(t)}
              className="p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              {t.title}
            </li>
          )) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No templates found. You can create them in Settings.</p>
          )}
        </ul>

        <button onClick={onClose} className="mt-6 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NewNoteModal;