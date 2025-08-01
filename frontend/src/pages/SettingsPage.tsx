import React from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore'; // Corrected import
import GitHubLoginButton from '../components/auth/GitHubLoginButton';

const SettingsPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Settings</h1>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">GitHub Sync</h2>
        {isAuthenticated && user ? (
          <div className="mt-2">
            <p>Logged in as: <span className="font-bold">{user.name || user.login}</span></p>
            <button
              onClick={logout}
              className="mt-4 px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
            >
              Logout from GitHub
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="mb-4">You are not logged in. Connect your GitHub account to sync snippets as Gists.</p>
            <GitHubLoginButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;