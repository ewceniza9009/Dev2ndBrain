import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import TagInput from './TagInput';
import type { Note, Deck } from '../../types';
import { debounce } from 'lodash-es';
import Toast from '../Toast';
import ConfirmationModal from '../ConfirmationModal';
import { PencilSquareIcon, BookOpenIcon, PlusCircleIcon, TrashIcon, LinkIcon } from '@heroicons/react/20/solid';
import RelatedNotesMenu from './RelatedNotesMenu';

const SelectDeckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: number, content: string) => void;
  decks: Deck[];
  noteContent: string;
}> = ({ isOpen, onClose, onSelectDeck, decks, noteContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select a Deck</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose a destination deck for the new flashcards.</p>
        <ul className="max-h-64 overflow-y-auto mb-4">
          {decks.map(deck => (
            <li
              key={deck.id}
              onClick={() => onSelectDeck(deck.id!, noteContent)}
              className="p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-teal-700 rounded cursor-pointer"
            >
              {deck.name}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-2 px-4 py-2 bg-gray-500 rounded text-white w-full">Cancel</button>
      </div>
    </div>
  );
};

interface NoteDetailViewProps {
  note: Note | null;
  isFromGraph?: boolean;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({ note, isFromGraph }) => {
  const [isEditing, setIsEditing] = useState(() => {
    const savedState = localStorage.getItem('isEditing');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const { notes, deleteNote, updateNote } = useNoteStore();
  const editorRef = useRef<any>(null);
  const [editedTitle, setEditedTitle] = useState(note?.title || '');
  const [isDeckModalOpen, setDeckModalOpen] = useState(false);
  const { decks, fetchDecks, createCardsFromContent } = useFlashcardStore();
  const [editorContent, setEditorContent] = useState(note?.content || '');
  const [isRelatedMenuOpen, setIsRelatedMenuOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('isEditing', JSON.stringify(isEditing));
  }, [isEditing]);

  useEffect(() => {
    if (note) {
      setEditedTitle(note.title);
      setEditorContent(note.content);
      fetchDecks();
      setIsRelatedMenuOpen(false);
    }
  }, [note, fetchDecks]);

  const debouncedUpdateTitle = useCallback(
    debounce((id: number, title: string) => {
      updateNote(id, { title });
    }, 1000),
    [updateNote]
  );

  useEffect(() => {
    if (note && editedTitle !== note.title) {
      debouncedUpdateTitle(note.id!, editedTitle);
    }
    return () => debouncedUpdateTitle.cancel();
  }, [editedTitle, note, debouncedUpdateTitle]);

  const handleDelete = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (note) {
      deleteNote(note.id!);
      setIsConfirmModalOpen(false);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if (note) {
      updateNote(note.id!, { tags: newTags });
    }
  };

  const handleCreateFlashcards = (deckId: number, content: string) => {
    if (note) {
      createCardsFromContent(content, deckId);
      setDeckModalOpen(false);
      setToast({ message: 'Flashcards created successfully!', type: 'success' });
    }
  };

  const closeToast = () => setToast(null);

  if (!note) {
    return <div className="p-8 text-gray-400">Select a note from the list or create a new one.</div>;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="relative flex justify-between items-center mb-2">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-semibold text-gray-900 dark:text-gray-200 bg-transparent w-full focus:outline-none"
          placeholder="Note Title"
        />
        <div className="flex space-x-2 flex-shrink-0 ml-4 items-center">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isEditing ? (
              <><BookOpenIcon className="h-5 w-5" /><span>Read</span></>
            ) : (
              <><PencilSquareIcon className="h-5 w-5" /><span>Edit</span></>
            )}
          </button>
          <button
            onClick={() => setIsRelatedMenuOpen(prev => !prev)}
            className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
            title="Show related notes"
          >
            <LinkIcon className="h-5 w-5" />
            <span>Related</span>
          </button>
          <button
            onClick={() => {
              if (editorRef.current) {
                setEditorContent(editorRef.current.getValue());
              }
              setDeckModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
            title="Create Flashcards from Note"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Flashcards</span>
          </button>
          <button onClick={handleDelete} className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200">
            <TrashIcon className="h-5 w-5" />
            <span>Delete</span>
          </button>
        </div>
        
         <RelatedNotesMenu
            isOpen={isRelatedMenuOpen}
            onClose={() => setIsRelatedMenuOpen(false)}
            currentNote={note}
            allNotes={notes}
        />
      </div>
      
      <div className="mb-4">
        <TagInput tags={note.tags} onTagsChange={handleTagsChange} />
      </div>

      <div className="flex-grow pt-2">
        {isEditing ? (
          <NoteEditor note={note} editorRef={editorRef} />
        ) : (
          <NoteViewer note={note} fromGraph={isFromGraph} />
        )}
      </div>

      <SelectDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setDeckModalOpen(false)}
        onSelectDeck={handleCreateFlashcards}
        decks={decks}
        noteContent={editorContent}
      />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default NoteDetailView;