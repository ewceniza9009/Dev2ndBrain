import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import NoteEditor from './NoteEditor';
import LinkModal from './LinkModal';
import type { Note } from '../../types';
import { debounce } from 'lodash-es'; // Import debounce for auto-saving

interface NoteDetailViewProps {
  note: Note | null;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({ note }) => {
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const { deleteNote, updateNote } = useNoteStore(); // Get updateNote from the store
  const editorRef = useRef<any>(null);

  // Local state to manage the title input
  const [editedTitle, setEditedTitle] = useState(note?.title || '');

  // Debounced function to save the title after the user stops typing
  const debouncedUpdateTitle = useCallback(
    debounce((id: number, title: string) => {
      updateNote(id, { title });
    }, 1000), // 1-second delay
    [] // No dependencies needed for the debounced function itself
  );

  // Effect to trigger the debounced save when the title changes
  useEffect(() => {
    if (note && editedTitle !== note.title) {
      debouncedUpdateTitle(note.id!, editedTitle);
    }
    // Cleanup the debounce timer if the component unmounts
    return () => debouncedUpdateTitle.cancel();
  }, [editedTitle, note, debouncedUpdateTitle]);

  // Effect to update the local title when a new note is selected
  useEffect(() => {
    if (note) {
      setEditedTitle(note.title);
    }
  }, [note]);


  const handleSelectNote = (selectedNote: Note) => {
    const linkText = `[[${selectedNote.uuid}]]`;
    editorRef.current?.executeEdits('', [{
      range: editorRef.current.getSelection(),
      text: linkText,
      forceMoveMarkers: true,
    }]);
    setLinkModalOpen(false);
  };

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
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSelectNote={handleSelectNote}
      />
      <div className="flex justify-between items-center mb-4 pb-2">
        {/* The H1 is now an input field for the title */}
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-semibold text-gray-900 dark:text-gray-200 bg-transparent w-full focus:outline-none"
          placeholder="Note Title"
        />
        <div className="flex space-x-2 flex-shrink-0 ml-4">
          <button onClick={() => setLinkModalOpen(true)} className="px-4 py-2 text-sm bg-purple-600 rounded-lg text-white">Link Note</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white">Delete</button>
        </div>
      </div>
      <div className="flex-grow pt-2">
        <NoteEditor note={note} editorRef={editorRef} />
      </div>
    </div>
  );
};

export default NoteDetailView;