import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, type AuthState } from './stores/useAuthStore';
import { useAppStore } from './stores/useAppStore'; // Import the new app store
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import NotesListPage from './pages/NotesListPage'; // I
import SnippetsPage from './pages/SnippetsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import GraphPage from './pages/GraphPage';
import SettingsPage from './pages/SettingsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state: AuthState) => state.initializeAuth);
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  const initTheme = useAppStore((state) => state.initTheme); // Get the init function

  useEffect(() => {
    initializeAuth();
    initTheme(); // Initialize the theme on app load
  }, [initializeAuth, initTheme]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="notes" element={<NotesListPage />} /> {/* New route for the list */}
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