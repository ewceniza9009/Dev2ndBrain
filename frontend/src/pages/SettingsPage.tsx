import React, { useState, useRef } from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore';
import GitHubLoginButton from '../components/auth/GitHubLoginButton';
import { syncService } from '../services/syncService';
import { importExportService } from '../services/importExportService';
import TemplateManager from '../components/settings/TemplateManager';
import {
  ArrowLeftOnRectangleIcon, CloudArrowUpIcon, CloudArrowDownIcon, ArrowDownTrayIcon, ArrowUpTrayIcon
} from '@heroicons/react/20/solid';

const SettingsPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [pullMessage, setPullMessage] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const blob = await importExportService.exportDatabase();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        a.download = `dev2ndbrain-backup-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert("Export failed. Check the console for details.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.confirm("Are you sure you want to import this file? This will completely overwrite all existing data in the application.")) {
        setIsImporting(true);
        try {
            await importExportService.importDatabase(file);
            // The service will handle reloading the page on success.
        } catch (error) {
            alert("Import failed. Make sure you are using a valid backup file. Check the console for details.");
            setIsImporting(false);
        }
    }
     // Reset file input value to allow re-uploading the same file
    if(event.target) event.target.value = '';
  };


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Settings</h1>

      <TemplateManager />

      <div className="p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Database Management</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Export your entire local database to a JSON file for backup. You can import this file later on this or another device.
            <strong className="text-red-500"> Importing will overwrite all current data.</strong>
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">             
             <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
            </button>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
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
            <p className="mb-4 text-gray-600 dark:text-gray-400">You are not logged in. Connect your GitHub account to sync snippets as Gists and enable cloud backup.</p>
            <GitHubLoginButton />
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Cloud Backup (Experimental)</h2>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Push local changes to back up your data to the server. Pull to restore your local data from the server's backup, which will overwrite your current local data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handlePush}
                disabled={isPushing}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>{isPushing ? 'Pushing...' : 'Push to Cloud'}</span>
              </button>
              <button
                onClick={handlePull}
                disabled={isPulling}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowDownIcon className="h-5 w-5" />
                <span>{isPulling ? 'Pulling...' : 'Pull from Cloud'}</span>
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
            Please log in with GitHub to enable cloud backup.
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;