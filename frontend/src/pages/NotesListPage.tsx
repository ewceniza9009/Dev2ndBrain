import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import NoteList from '../components/notes/NoteList';
import NoteDetailView from '../components/notes/NoteDetailView';
import type { Note } from '../types';

const NotesListPage: React.FC = () => {
  const { notes, fetchNotes, addNote } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true); // New state variable
  const location = useLocation();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    // This logic should only run on the initial load of the component
    if (initialLoad) {
      if (location.state?.selectedId) {
        setSelectedNoteId(location.state.selectedId);
      } else if (notes.length > 0) {
        const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setSelectedNoteId(sortedNotes[0].id!);
      }
      setInitialLoad(false);
    }
  }, [notes, location.state, initialLoad]);

  const handleNewNote = async () => {
    const newNote = await addNote({
      title: 'Untitled Note',
      content: '# New Note',
      tags: [],
    });
    if (newNote?.id) {
      setSelectedNoteId(newNote.id);
    }
  };

  const selectedNote = notes.find((n: Note) => n.id === selectedNoteId) || null;

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-700">
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onNewNote={handleNewNote}
        />
      </div>
      <div className="w-2/3">
        <NoteDetailView note={selectedNote} />
      </div>
    </div>
  );
};

export default NotesListPage;