import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import NoteList, { type NoteListHandle } from '../components/notes/NoteList';
import NoteDetailView from '../components/notes/NoteDetailView';
import NewNoteModal from '../components/notes/NewNoteModal';
import type { Note, Template } from '../types';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const NotesListPage: React.FC = () => {
  const { notes, templates, fetchNotes, fetchTemplates, addNote } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [sortOption] = useState<'updatedAt' | 'title'>('updatedAt');
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isFromGraph, setIsFromGraph] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');
  const noteListRef = useRef<NoteListHandle>(null);

  useEffect(() => {
    fetchNotes();
    fetchTemplates();
  }, [fetchNotes, fetchTemplates]);

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedNoteId(location.state.selectedId);
      setIsFromGraph(location.state.isFromGraph || false);
      navigate(location.pathname, { replace: true });
    }
    else if (!selectedNoteId && notes.length > 0) {
      const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSelectedNoteId(sortedNotes[0].id!);
      setIsFromGraph(false);
    }
  }, [notes, selectedNoteId, location.state, navigate]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, sortOption]);

  const filteredNotes = useMemo(() => {
    if (!filterTerm) return sortedNotes;
    const lowercasedFilter = filterTerm.toLowerCase();
    return sortedNotes.filter(note =>
      note.title.toLowerCase().includes(lowercasedFilter) ||
      note.content.toLowerCase().includes(lowercasedFilter)
    );
  }, [sortedNotes, filterTerm]);

  const handleNewNote = async (template?: Template) => {
    setIsNewNoteModalOpen(false);
    const newNote = await addNote({
      title: template ? template.title : 'Untitled Note',
      content: template ? template.content : '# New Note',
      tags: [],
    });
    if (newNote?.id) {
      setSelectedNoteId(newNote.id);
    }
  };

  const selectedNote = notes.find((n: Note) => n.id === selectedNoteId) || null;
  
  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newFilterTerm = (e.target as HTMLInputElement).value;
      setFilterTerm(newFilterTerm);
      if (newFilterTerm) {
        noteListRef.current?.expandAll();
      }
    }
  };

  return (
    <>
      <div className="flex h-full">
        <div className="w-1/4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Notes</h2>
                <button
                  onClick={() => setIsNewNoteModalOpen(true)}
                  className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New</span>
                </button>
            </div>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Filter notes and press Enter..."
                    onKeyDown={handleFilterKeyDown}
                    className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                />
            </div>
          </div>
          <NoteList
            ref={noteListRef}
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onNewNote={() => setIsNewNoteModalOpen(true)}
          />
        </div>
        <div className="w-3/4 h-full overflow-y-auto">
          <NoteDetailView note={selectedNote} isFromGraph={isFromGraph} />
        </div>
      </div>
      <NewNoteModal
        isOpen={isNewNoteModalOpen}
        templates={templates}
        onClose={() => setIsNewNoteModalOpen(false)}
        onSelect={handleNewNote}
      />
    </>
  );
};

export default NotesListPage;