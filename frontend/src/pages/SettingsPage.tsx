import React, { useState } from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore';
import GitHubLoginButton from '../components/auth/GitHubLoginButton';
import { syncService } from '../services/syncService';
import TemplateManager from '../components/settings/TemplateManager'; 

const SettingsPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [pullMessage, setPullMessage] = useState('');

  const handlePush = async () => {
    setIsPushing(true);
    setPushMessage('');
    try {
      const result = await syncService.pushAllData();
      setPushMessage(result.message || 'Push successful!');
    } catch (error: any) {
      console.error('Push failed:', error);
      setPushMessage(`Push failed: ${error.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    setPullMessage('');
    try {
      if (!window.confirm("This will overwrite all local data with the backend backup. Are you sure?")) {
        setIsPulling(false);
        return;
      }
      const result = await syncService.pullAllData();
      setPullMessage(result.message || 'Pull successful!');
    } catch (error: any) {
      console.error('Pull failed:', error);
      setPullMessage(`Pull failed: ${error.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Settings</h1>

      {/* Note Templates Section */}
      <TemplateManager />

      {/* GitHub Sync Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
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

      {/* Backend Sync Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Backend Backup</h2>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              **Push** local changes to back up your data to the server.
              **Pull** to restore your local data from the server's backup, which will overwrite your current local data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handlePush}
                disabled={isPushing}
                className="px-4 py-2 font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPushing ? 'Pushing...' : 'Push Local Data'}
              </button>
              <button
                onClick={handlePull}
                disabled={isPulling}
                className="px-4 py-2 font-medium leading-5 text-white transition-colors duration-150 bg-gray-600 border border-transparent rounded-lg active:bg-gray-600 hover:bg-gray-700 focus:outline-none focus:shadow-outline-gray disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPulling ? 'Pulling...' : 'Pull from Backend'}
              </button>
            </div>
            {pushMessage && (
              <p className={`mt-2 text-sm ${pushMessage.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                {pushMessage}
              </p>
            )}
            {pullMessage && (
              <p className={`mt-2 text-sm ${pullMessage.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                {pullMessage}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please log in with GitHub to enable backend backup.
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;