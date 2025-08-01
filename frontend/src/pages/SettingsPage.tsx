import React, { useState } from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore'; 
import GitHubLoginButton from '../components/auth/GitHubLoginButton';
import { syncService } from '../services/syncService';
 
 const SettingsPage: React.FC = () => {
   const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
   const user = useAuthStore((state: AuthState) => state.user);
   const logout = useAuthStore((state: AuthState) => state.logout);
 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const result = await syncService.syncAllData();
      setSyncMessage(result.Message || 'Sync successful!');
      alert('Sync successful!'); // Simple feedback
    } catch (error: any) {
      console.error('Sync failed:', error);
      setSyncMessage(`Sync failed: ${error.message}`);
      alert(`Sync failed: ${error.message}`); // Simple feedback
    } finally {
      setIsSyncing(false);
    }
  };

   return (
     <div>
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Settings</h1>

        {/* GitHub Section */}
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

        {/* Backend Sync Section */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Backend Backup</h2>
          {isAuthenticated ? (
              <div>
                  <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Backup all your local notes, snippets, and flashcards to the server. This is a one-way push from your device to the backend.
                  </p>
                  <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="px-4 py-2 font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSyncing ? 'Syncing...' : 'Sync All Data Now'}
                  </button>
                  {syncMessage && (
                      <p className={`mt-4 text-sm ${syncMessage.includes('failed') ? 'text-red-500' : 'text-red-400'}`}>
                          {syncMessage}
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
     </div>
   );
 };
 
 export default SettingsPage;