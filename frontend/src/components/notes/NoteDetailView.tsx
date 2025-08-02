import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import TagInput from './TagInput';
import type { Note, Deck } from '../../types';
import { debounce } from 'lodash-es';

// This is the modal component for selecting a deck
const SelectDeckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: number) => void;
  decks: Deck[];
}> = ({ isOpen, onClose, onSelectDeck, decks }) => {
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
              onClick={() => onSelectDeck(deck.id!)}
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
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(true);
  const { deleteNote, updateNote } = useNoteStore();
  const editorRef = useRef<any>(null);
  const [editedTitle, setEditedTitle] = useState(note?.title || '');
  const [isDeckModalOpen, setDeckModalOpen] = useState(false);
  const { decks, fetchDecks, createCardsFromContent } = useFlashcardStore();

  const debouncedUpdateTitle = useCallback(
    debounce((id: number, title: string) => {
      updateNote(id, { title });
    }, 1000),
    []
  );

  useEffect(() => {
    if (note && editedTitle !== note.title) {
      debouncedUpdateTitle(note.id!, editedTitle);
    }
    return () => debouncedUpdateTitle.cancel();
  }, [editedTitle, note, debouncedUpdateTitle]);

  useEffect(() => {
    if (note) {
      setEditedTitle(note.title);
      setIsEditing(true);  
      fetchDecks();
    }
  }, [note, fetchDecks]);

  const handleDelete = () => {
    if (note && window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNote(note.id!);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if (note) {
      updateNote(note.id!, { tags: newTags });
    }
  };

  const handleCreateFlashcards = (deckId: number) => {
    if (note) {
      const content = editorRef.current ? editorRef.current.getValue() : note.content;
      createCardsFromContent(content, deckId);
      setDeckModalOpen(false);
      alert('Flashcards created successfully!');
    }
  };

  if (!note) {
    return <div className="p-8 text-gray-400">Select a note from the list or create a new one.</div>;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-semibold text-gray-900 dark:text-gray-200 bg-transparent w-full focus:outline-none"
          placeholder="Note Title"
        />
        <div className="flex space-x-2 flex-shrink-0 ml-4">
          {/* This is the button to create flashcards */}
          <button
            onClick={() => setDeckModalOpen(true)}
            className="px-3 py-2 text-xl bg-purple-600 rounded-lg text-white"
            title="Create Flashcards from Note"
          >
            📇
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm bg-blue-600 rounded-lg text-white"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white">Delete</button>
        </div>
      </div>
      
      <div className="mb-4">
        <TagInput tags={note.tags} onTagsChange={handleTagsChange} />
      </div>

      <div className="flex-grow pt-2 h-full">
        {isEditing ? (
          <NoteEditor note={note} editorRef={editorRef} />
        ) : (
          <NoteViewer note={note} />
        )}
      </div>

      {/* The modal for selecting a deck */}
      <SelectDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setDeckModalOpen(false)}
        onSelectDeck={handleCreateFlashcards}
        decks={decks}
      />
    </div>
  );
};

export default NoteDetailView;