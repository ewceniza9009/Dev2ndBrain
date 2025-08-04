import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import NoteList from '../components/notes/NoteList';
import NoteDetailView from '../components/notes/NoteDetailView';
import NewNoteModal from '../components/notes/NewNoteModal';
import type { Note, Template } from '../types';
import { PlusIcon } from '@heroicons/react/20/solid';

const NotesListPage: React.FC = () => {
  const { notes, templates, fetchNotes, fetchTemplates, addNote } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<'updatedAt' | 'title'>('updatedAt');
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isFromGraph, setIsFromGraph] = useState(false);

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
    const sorted = [...notes].sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return sorted;
  }, [notes, sortOption]);

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

  return (
    <>
      <div className="flex h-full">
        <div className="w-1/3 border-r border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg -mt-2.5 font-semibold text-gray-900 dark:text-white">All Notes</h2>
          <div className="flex items-center space-x-4">
            <div className="relative w-52">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as 'updatedAt' | 'title')}
                className="block w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="updatedAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 12a1 1 0 01-.7-.29l-3-3a1 1 0 011.4-1.42L10 9.58l2.3-2.29a1 1 0 111.4 1.42l-3 3A1 1 0 0110 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setIsNewNoteModalOpen(true)}
              className="relative -mt-2.5 flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
        </div>
          <NoteList
            notes={sortedNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onNewNote={() => setIsNewNoteModalOpen(true)}
          />
        </div>
        <div className="w-2/3">
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