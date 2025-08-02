import React from 'react';
import type { Template } from '../../types';

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
        
        {/* Blank Note Button */}
        <button onClick={() => onSelect()} className="w-full text-left p-3 mb-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
          <span className="font-semibold text-gray-900 dark:text-white">📝 Start with a Blank Note</span>
        </button>

        <hr className="border-gray-300 dark:border-gray-600 my-4" />
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Or use a template:</h3>
        
        {/* Template List */}
        <ul className="max-h-64 overflow-y-auto">
          {templates.length > 0 ? templates.map(t => (
            <li
              key={t.id}
              onClick={() => onSelect(t)}
              className="p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-teal-700 rounded cursor-pointer"
            >
              {t.title}
            </li>
          )) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No templates found. You can create them in Settings.</p>
          )}
        </ul>

        <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-500 rounded text-white w-full">Cancel</button>
      </div>
    </div>
  );
};

export default NewNoteModal;