import React, { useState } from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore';
import GitHubLoginButton from '../components/auth/GitHubLoginButton';
import { syncService } from '../services/syncService';
import TemplateManager from '../components/settings/TemplateManager';
import { 
  ArrowLeftOnRectangleIcon, CloudArrowUpIcon, CloudArrowDownIcon 
} from '@heroicons/react/20/solid';

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

      <TemplateManager />

      <div className="mt-6 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">GitHub Sync</h2>
        {isAuthenticated && user ? (
          <div className="mt-2">
            <p className="text-gray-600 dark:text-gray-400">Logged in as: <span className="font-bold">{user.name || user.login}</span></p>
            <button
              onClick={logout}
              className="mt-4 flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Logout from GitHub</span>
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="mb-4 text-gray-600 dark:text-gray-400">You are not logged in. Connect your GitHub account to sync snippets as Gists.</p>
            <GitHubLoginButton />
          </div>
        )}
      </div>

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
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>{isPushing ? 'Pushing...' : 'Push Local Data'}</span>
              </button>
              <button
                onClick={handlePull}
                disabled={isPulling}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowDownIcon className="h-5 w-5" />
                <span>{isPulling ? 'Pulling...' : 'Pull from Backend'}</span>
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