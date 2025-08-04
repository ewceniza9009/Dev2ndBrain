// frontend/src/components/graph/NotePreviewModal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Note } from '../../types';
import NoteViewer from '../notes/NoteViewer';

interface NotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

const NotePreviewModal: React.FC<NotePreviewModalProps> = ({ isOpen, onClose, note }) => {
  const navigate = useNavigate();

  if (!isOpen || !note) {
    return null;
  }

  const handleNavigateToNote = () => {
    onClose();
    navigate(`/notes`, { state: { selectedId: note.id, isFromGraph: true } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{note.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <NoteViewer note={note} />
        </div>

        <div className="flex justify-end space-x-2 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={handleNavigateToNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Full Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotePreviewModal;