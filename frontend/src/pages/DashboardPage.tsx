// frontend/src/pages/DashboardPage.tsx

import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import { useFlashcardStore } from '../stores/useFlashcardStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { notes, fetchNotes, addNote } = useNoteStore();
  const { snippets, fetchSnippets } = useSnippetStore();
  const { allCards, fetchAllCards } = useFlashcardStore();

  useEffect(() => {
    fetchNotes();
    fetchSnippets();
    fetchAllCards();
  }, [fetchNotes, fetchSnippets, fetchAllCards]);

  const recentlyEditedNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [notes]);

  const dueFlashcardsCount = useMemo(() => {
    return allCards.filter(card => new Date(card.nextReview) <= new Date()).length;
  }, [allCards]);
  
  // NEW: Onboarding message for empty state
  const isNotesEmpty = notes.length === 0;
  const isSnippetsEmpty = snippets.length === 0;
  const isFlashcardsEmpty = allCards.length === 0;
 
  const renderOnboardingMessage = () => {
    if (isNotesEmpty && isSnippetsEmpty && isFlashcardsEmpty) {
      return (
        <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-lg text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to Dev2ndBrain! 🧠✨</h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Looks like your brain is a blank slate. That's a great place to start!</p>
          <div className="mt-4 space-y-2 text-left">
            <p><strong>Get Started with Notes:</strong> Create your first note to capture ideas, document projects, or interlink concepts. Use the `New` button in the Notes section to begin. You can even use a template from the Settings page.</p>
            <p><strong>Manage Code Snippets:</strong> Have a handy code snippet you use often? Save it here! Click `New Snippet` in the Snippets section to add your first piece of code. You can also sync it with your GitHub Gists.</p>
            <p><strong>Start Your Learning Journey:</strong> Ready to master a new topic? Head over to Flashcards, create a new deck, and add some cards. The spaced repetition system will help you remember what matters.</p>
            <p className="mt-4 text-sm italic"><strong>Pro Tip:</strong> Use the `Ctrl + K` (or `Cmd + K`) shortcut to open the <strong>Command Palette</strong> and quickly create new items or navigate the app. Happy brain building!</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleCreateNote = async () => {
    const newNote = await addNote({ title: 'New Note', content: '', tags: [] });
    if (newNote?.id) navigate(`/notes`, { state: { selectedId: newNote.id } });
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>

      {renderOnboardingMessage()}
     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Flashcard Review</h2>
            <div className="text-center">
              <p className="text-5xl font-bold text-teal-500 dark:text-teal-400">{dueFlashcardsCount}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">cards due for review</p>
              <button
                onClick={() => navigate('/flashcards')}
                className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600"
                disabled={dueFlashcardsCount === 0}
              >
                Start Review Session
              </button>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">At a Glance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>Total Notes</span>
                <span className="font-bold text-gray-900 dark:text-white">{notes.length}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>Total Snippets</span>
                <span className="font-bold text-gray-900 dark:text-white">{snippets.length}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>Total Flashcards</span>
                <span className="font-bold text-gray-900 dark:text-white">{allCards.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recently Edited Notes</h2>
            {recentlyEditedNotes.length > 0 ? (
              <ul className="space-y-2">
                {recentlyEditedNotes.map(note => (
                  <li key={note.id}>
                    <Link to={`/notes`} state={{ selectedId: note.id }} className="block p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Edited: {new Date(note.updatedAt).toLocaleString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No notes yet. Create one to get started!</p>
            )}
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleCreateNote} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-300 dark:hover:bg-gray-600">
                <span role="img" aria-label="Note">📝</span>
                <span className="block mt-2 font-semibold text-gray-900 dark:text-white">New Note</span>
              </button>
              <button onClick={() => navigate('/snippets')} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-300 dark:hover:bg-gray-600">
                <span role="img" aria-label="Snippet">💻</span>
                <span className="block mt-2 font-semibold text-gray-900 dark:text-white">New Snippet</span>
              </button>
              <button onClick={() => navigate('/flashcards')} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-300 dark:hover:bg-gray-600">
                <span role="img" aria-label="Deck">📇</span>
                <span className="block mt-2 font-semibold text-gray-900 dark:text-white">New Deck</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;