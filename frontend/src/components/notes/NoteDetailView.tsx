import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import type { Note } from '../../types';
import { debounce } from 'lodash-es';

interface NoteDetailViewProps {
  note: Note | null;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteNote, updateNote } = useNoteStore();
  const editorRef = useRef<any>(null);

  const [editedTitle, setEditedTitle] = useState(note?.title || '');

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
      setIsEditing(false);
    }
  }, [note]);

  const handleDelete = () => {
    if (note && window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNote(note.id!);
    }
  };

  if (!note) {
    return <div className="p-8 text-gray-400">Select a note from the list or create a new one.</div>;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-4 pb-2">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-semibold text-gray-900 dark:text-gray-200 bg-transparent w-full focus:outline-none"
          placeholder="Note Title"
        />
        <div className="flex space-x-2 flex-shrink-0 ml-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm bg-blue-600 rounded-lg text-white"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white">Delete</button>
        </div>
      </div>
      <div className="flex-grow pt-2 h-full">
        {isEditing ? (
          <NoteEditor note={note} editorRef={editorRef} />
        ) : (
          <NoteViewer note={note} />
        )}
      </div>
    </div>
  );
};

export default NoteDetailView;