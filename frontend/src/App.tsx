import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, type AuthState } from './stores/useAuthStore';
import { useNoteStore } from './stores/useNoteStore';
import { useSnippetStore } from './stores/useSnippetStore';
import { useFlashcardStore } from './stores/useFlashcardStore';
import { useProjectStore } from './stores/useProjectStore';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import NotesListPage from './pages/NotesListPage';
import SnippetsPage from './pages/SnippetsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import GraphPage from './pages/GraphPage';
import SettingsPage from './pages/SettingsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ClipPage from './pages/ClipPage';
import ProjectsPage from './pages/ProjectsPage';

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state: AuthState) => state.initializeAuth);
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);

  // Get the fetch functions from all the data stores
  const { fetchNotes, fetchTemplates } = useNoteStore();
  const { fetchSnippets } = useSnippetStore();
  const { fetchProjects } = useProjectStore();
  const { fetchDecks, fetchAllCards } = useFlashcardStore();

  useEffect(() => {
    // Initialize authentication first
    initializeAuth();

    // Trigger all data fetching on initial app load
    fetchNotes();
    fetchTemplates();
    fetchSnippets();
    fetchProjects();
    fetchDecks();
    fetchAllCards();
    
  }, [initializeAuth, fetchNotes, fetchTemplates, fetchSnippets, fetchProjects, fetchDecks, fetchAllCards]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/clip" element={<ClipPage />} />
        <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="notes" element={<NotesListPage />} />
            <Route path="snippets" element={<SnippetsPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="graph" element={<GraphPage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;