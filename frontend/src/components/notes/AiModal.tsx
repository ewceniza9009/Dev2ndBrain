import React, { useState } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/20/solid';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = window.electronAPI
  ? 'https://localhost:7150'
  : import.meta.env.VITE_API_BASE_URL;

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  onInsertText: (text: string) => void;
}

const AiModal: React.FC<AiModalProps> = ({ isOpen, onClose, noteContent, onInsertText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handlePromptClick = async (prompt: string, isActionPlanPrompt: boolean) => {
    setIsLoading(true);
    setResponse('');
    try {
      const url = isActionPlanPrompt
        ? `${API_BASE_URL}/api/ai/action-plan`
        : `${API_BASE_URL}/api/ai/prompt`;

      const requestBody = isActionPlanPrompt
        ? { content: noteContent }
        : { prompt, content: noteContent };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'AI service returned an error.');
      }

      const completion = data.completion || 'No response from AI.';
      setResponse(completion);
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomPrompt = () => {
    if (customPrompt.trim()) {
      handlePromptClick(customPrompt.trim(), false);
    }
  };

  const handleInsert = () => {
    onInsertText(`\n\n---\n**✨ AI Assistant:**\n${response}`);
    onClose();
  };

  const promptButtons = [
    {
      label: 'Summarize',
      prompt: 'Summarize the following note into key bullet points.',
      isActionPlan: false,
      icon: ClipboardDocumentListIcon,
    },
    {
      label: 'Find Action Items',
      prompt: 'Extract any potential action items or to-do tasks from the following note.',
      isActionPlan: true,
      icon: SparklesIcon,
    },
    {
      label: 'Explain This',
      prompt: 'Explain the concepts in this note as if I were a beginner.',
      isActionPlan: false,
      icon: ChatBubbleLeftRightIcon,
    },
    {
      label: 'Generate Ideas',
      prompt: 'Based on this note, brainstorm three related ideas or topics to explore next.',
      isActionPlan: false,
      icon: LightBulbIcon,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant ✨</h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {promptButtons.map(({ label, prompt, isActionPlan, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handlePromptClick(prompt, isActionPlan)}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Or, ask a custom question:</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter your custom prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-grow p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleCustomPrompt}
              disabled={isLoading || !customPrompt.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
            >
              Run
            </button>
          </div>
        </div>

        <div className="w-full p-4 h-64 overflow-y-auto bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Thinking...</p>
          ) : response ? (
            <article className="prose dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-gray-200">
              <ReactMarkdown>{response}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Select a prompt or enter a custom one to begin.</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleInsert}
            disabled={!response || isLoading}
            className="flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Insert Below Note</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiModal;
