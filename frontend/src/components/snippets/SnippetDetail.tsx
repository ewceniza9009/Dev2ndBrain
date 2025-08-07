import React, { useState, useEffect } from 'react';
import type { Snippet } from '../../types';
import { useSnippetStore } from '../../stores/useSnippetStore';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../stores/useAppStore';
import ConsoleOutput from './ConsoleOutput';
import { openCodeRunnerWindow } from './CodeRunner';
import { openReactRunnerWindow } from './ReactRunner';
import SnippetAiModal from './SnippetAiModal';
import {
  PencilSquareIcon, TrashIcon, CloudArrowUpIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PlayIcon, SparklesIcon, XMarkIcon,
  CheckIcon
} from '@heroicons/react/20/solid';

const API_BASE_URL = window.electronAPI
  ? 'https://localhost:7150' // In Electron, talk directly to the backend
  : import.meta.env.VITE_API_BASE_URL; // For web/Docker, use the .env file

const SnippetDetail: React.FC<{ snippet: Snippet | null }> = ({ snippet }) => {
  const { updateSnippet, deleteSnippet, syncSnippetToGist, pullFromGist, pushToGist } = useSnippetStore();
  const theme = useAppStore((state) => state.theme);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSnippet, setEditedSnippet] = useState(snippet);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [userInputs, setUserInputs] = useState('');
  const [showCSharpModal, setShowCSharpModal] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    setEditedSnippet(snippet);
    setConsoleOutput('');
    setUserInputs('');
    setShowCSharpModal(false);
    if (snippet && snippet.title === 'New Snippet' && snippet.code === '') {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [snippet]);

  const handleSave = () => {
    if (editedSnippet) {
      const tagsAsArray = Array.isArray(editedSnippet.tags)
        ? editedSnippet.tags
        : String(editedSnippet.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
      updateSnippet(editedSnippet.id!, { ...editedSnippet, tags: tagsAsArray });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (snippet && window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      deleteSnippet(snippet.id!);
    }
  };

  const handleRunCSharp = async () => {
    if (!snippet) return;
    setIsCodeRunning(true);
    setConsoleOutput('');
    setShowCSharpModal(true);
    try {
      const inputs = userInputs.split('\n').map((input) => input.trim()).filter(Boolean);
      const response = await fetch(`${API_BASE_URL}/api/execute/csharp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: snippet.code, inputs }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setConsoleOutput(result.output || 'No output');
    } catch (error: any) {
      setConsoleOutput(`Error: ${error.message || 'Failed to execute code'}`);
    } finally {
      setIsCodeRunning(false);
    }
  };

  const handlePopoutWeb = () => {
    if (snippet) {
      openCodeRunnerWindow(snippet.code, snippet.language);
    }
  };

  const handleRunReact = () => {
    if (snippet) {
      openReactRunnerWindow(snippet.code);
    }
  };

  if (!snippet || !editedSnippet) {
    return <div className="p-8 text-gray-500 dark:text-gray-400">Select a snippet from the list or create a new one.</div>;
  }

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 h-full flex flex-col">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            value={editedSnippet.title}
            onChange={(e) => setEditedSnippet({ ...editedSnippet, title: e.target.value })}
            className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              id="language"
              value={editedSnippet.language}
              onChange={(e) => setEditedSnippet({ ...editedSnippet, language: e.target.value })}
              className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="react">React (TSX)</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="shell">Shell</option>
              <option value="plaintext">Plain Text</option>
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={Array.isArray(editedSnippet.tags) ? editedSnippet.tags.join(', ') : editedSnippet.tags}
              onChange={(e) => setEditedSnippet({ ...editedSnippet, tags: e.target.value.split(',').map((t) => t.trim()) })}
              className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-grow border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <Editor
            height="100%"
            language={editedSnippet.language === 'react' ? 'typescript' : editedSnippet.language}
            value={editedSnippet.code}
            onChange={(value) => setEditedSnippet({ ...editedSnippet, code: value || '' })}
            theme={theme === 'light' ? 'vs' : 'vs-dark'}
            options={{ minimap: { enabled: false } }}
          />
        </div>
        <div className="flex-shrink-0 flex space-x-2">
          <button onClick={handleSave} className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200">
              <CheckIcon className="h-5 w-5" />
              <span>Save</span>
          </button>
          <button
              onClick={() => setIsEditing(false)}
              className="flex items-center space-x-1 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
              <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  const isRunnableWeb = snippet.language === 'html' || snippet.language === 'javascript';
  const isRunnableReact = snippet.language === 'react';

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{snippet.title}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              SYNTAX: <span className="font-semibold text-gray-700 dark:text-gray-300">{snippet.language.toUpperCase()}</span>
            </p>
            <div className="flex space-x-2">
              {snippet.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-teal-800 dark:text-teal-300 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button onClick={() => setIsAiModalOpen(true)} className="flex items-center space-x-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200">
            <SparklesIcon className="h-5 w-5" />
            <span>Ask AI</span>
          </button>
          {isRunnableWeb && (
            <button onClick={handlePopoutWeb} className="flex items-center space-x-1 bg-cyan-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-cyan-700 shadow-md hover:shadow-lg transition-all duration-200">
              <PlayIcon className="h-5 w-5" />
              <span>Popout Web</span>
            </button>
          )}
          {isRunnableReact && (
            <button onClick={handleRunReact} className="flex items-center space-x-1 bg-sky-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-sky-700 shadow-md hover:shadow-lg transition-all duration-200">
              <PlayIcon className="h-5 w-5" />
              <span>Run React</span>
            </button>
          )}
          {snippet.language === 'csharp' && (
            <button onClick={handleRunCSharp} className="flex items-center space-x-1 bg-cyan-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-cyan-700 shadow-md hover:shadow-lg transition-all duration-200">
              <PlayIcon className="h-5 w-5" />
              <span>Run C#</span>
            </button>
          )}
          {snippet.gistId ? (
            <>
              <a href={`https://gist.github.com/${snippet.gistId}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm hover:bg-black shadow-md hover:shadow-lg transition-all duration-200" title="View on Gist">
                <span>🔗</span>
              </a>
              <button onClick={() => pullFromGist(snippet.id!)} className="flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200" title="Pull from Gist">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Pull</span>
              </button>
              <button onClick={() => pushToGist(snippet.id!)} className="flex items-center space-x-1 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200" title="Push to Gist">
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>Push</span>
              </button>
            </>
          ) : (
            <button onClick={() => syncSnippetToGist(snippet.id!)} className="flex items-center space-x-1 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Sync to Gist</span>
            </button>
          )}
          <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200">
            <PencilSquareIcon className="h-5 w-5" />
            <span>Edit</span>
          </button>
          <button onClick={handleDelete} className="flex items-center space-x-1 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200">
            <TrashIcon className="h-5 w-5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex-grow border border-gray-300 dark:border-gray-600 rounded-t-lg overflow-hidden">
          <Editor
            key={snippet.id}
            height="100%"
            language={snippet.language === 'react' ? 'typescript' : snippet.language}
            value={snippet.code}
            theme={theme === 'light' ? 'vs' : 'vs-dark'}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>
        {showCSharpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 relative">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">C# Sandbox Output</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inputs for Console.ReadLine (one per line)</label>
                  <textarea value={userInputs} onChange={(e) => setUserInputs(e.target.value)} className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} placeholder="Enter inputs, one per line (e.g., Alice\n25)" disabled={isCodeRunning} />
                </div>
                <ConsoleOutput output={consoleOutput} isLoading={isCodeRunning} />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={handleRunCSharp} disabled={isCodeRunning} className="flex items-center space-x-1 bg-cyan-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-cyan-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500">
                  <PlayIcon className="h-5 w-5" />
                  <span>{isCodeRunning ? 'Running...' : 'Run Again'}</span>
                </button>
                <button onClick={() => setShowCSharpModal(false)} className="flex items-center space-x-1 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
                  <XMarkIcon className="h-5 w-5" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <SnippetAiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} snippet={snippet} />
    </div>
  );
};

export default SnippetDetail;