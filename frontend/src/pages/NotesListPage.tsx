import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import NoteList from '../components/notes/NoteList';
import NoteDetailView from '../components/notes/NoteDetailView';

const NotesListPage: React.FC = () => {
  const { notes, fetchNotes, addNote } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    // Check for an ID passed from the search bar
    if (location.state?.selectedId) {
      setSelectedNoteId(location.state.selectedId);
    } 
    // Otherwise, select the most recent note
    else if (!selectedNoteId && notes.length > 0) {
      const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSelectedNoteId(sortedNotes[0].id!);
    }
  }, [notes, selectedNoteId, location.state]);

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

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

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