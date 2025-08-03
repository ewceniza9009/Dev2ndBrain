import React, { useState } from 'react';

interface NewDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const NewDeckModal: React.FC<NewDeckModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [deckName, setDeckName] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (deckName.trim()) {
      onConfirm(deckName.trim());
      setDeckName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enter new deck name:</h2>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Frontend Interview Questions"
          className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
          autoFocus
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-teal-600 rounded-lg text-white hover:bg-teal-700">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDeckModal;