import React, { useState, useEffect } from 'react';
import type { Snippet } from '../../types';
import { useSnippetStore } from '../../stores/useSnippetStore';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../stores/useAppStore';

interface SnippetDetailProps {
  snippet: Snippet | null;
}

const SnippetDetail: React.FC<SnippetDetailProps> = ({ snippet }) => {
  const { updateSnippet, deleteSnippet } = useSnippetStore();
  const theme = useAppStore((state) => state.theme);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSnippet, setEditedSnippet] = useState(snippet);

  useEffect(() => {
    setEditedSnippet(snippet);
    if (snippet && !snippet.id) { // If it's a new, unsaved snippet
        setIsEditing(true);
    } else {
        setIsEditing(false);
    }
  }, [snippet]);

  const handleSave = () => {
    if (editedSnippet) {
      const tagsAsArray = Array.isArray(editedSnippet.tags)
        ? editedSnippet.tags
        : String(editedSnippet.tags).split(',').map(t => t.trim()).filter(Boolean);
      
      updateSnippet(editedSnippet.id!, { ...editedSnippet, tags: tagsAsArray });
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    if (snippet && window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
        deleteSnippet(snippet.id!);
    }
  }

  if (!snippet || !editedSnippet) {
    return <div className="p-8 text-gray-500 dark:text-gray-400">Select a snippet from the list or create a new one.</div>;
  }

  if (isEditing) {
    return (
      <div className="p-6 space-y-4">
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
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select
              id="language"
              value={editedSnippet.language}
              onChange={(e) => setEditedSnippet({ ...editedSnippet, language: e.target.value })}
              className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="csharp">C#</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="plaintext">Plain Text</option>
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={Array.isArray(editedSnippet.tags) ? editedSnippet.tags.join(', ') : editedSnippet.tags}
              onChange={(e) => setEditedSnippet({ ...editedSnippet, tags: e.target.value.split(',').map(t => t.trim()) })}
              className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="h-96 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <Editor
            language={editedSnippet.language}
            value={editedSnippet.code}
            onChange={(value) => setEditedSnippet({ ...editedSnippet, code: value || '' })}
            theme={theme === 'light' ? 'vs' : 'vs-dark'}
          />
        </div>
        <div className="flex space-x-2">
          <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Save</button>
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{snippet.title}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">SYNTAX: <span className="font-semibold text-gray-700 dark:text-gray-300">{snippet.language.toUpperCase()}</span></p>
            <div className="flex space-x-2">
              {snippet.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-teal-800 dark:text-teal-300 px-2 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg">Edit</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
        </div>
      </div>
      <div className="h-[70vh] border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <Editor
          language={snippet.language}
          value={snippet.code}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
};

export default SnippetDetail;