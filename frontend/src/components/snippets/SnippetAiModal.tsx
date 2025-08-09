import React, { useState } from 'react';
import type { Snippet } from '../../types';
import { CodeBracketIcon, HandRaisedIcon, XMarkIcon } from '@heroicons/react/20/solid';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = window.electronAPI
    ? 'https://localhost:7150'
    : import.meta.env.VITE_API_BASE_URL;

interface SnippetAiModalProps {
    isOpen: boolean;
    onClose: () => void;
    snippet: Snippet | null;
}

const SnippetAiModal: React.FC<SnippetAiModalProps> = ({ isOpen, onClose, snippet }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    if (!isOpen || !snippet) return null;

    const handlePrompt = async (promptText: string) => {
        setIsLoading(true);
        setResponse('');
        try {
            // Use the generic prompt endpoint for all actions
            const url = `${API_BASE_URL}/api/ai/prompt`;
            const requestBody = {
                prompt: promptText,
                content: `Here is the ${snippet.language} code snippet:\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``
            };

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

    const handleCustomPromptSubmit = () => {
        if (customPrompt.trim()) {
            handlePrompt(customPrompt.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant for Snippet: {snippet.title}</h2>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={() => handlePrompt(`Explain the following code snippet step-by-step.`)}
                        disabled={isLoading}
                        className="p-3 flex items-center justify-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
                    >
                        <HandRaisedIcon className='h-5 w-5 mx-2'/>
                        Explain Code
                    </button>
                    <button
                        onClick={() => handlePrompt(`Analyze the following code and provide suggestions for refactoring it to be more performant, readable, and follow best practices. Provide the refactored code block as well.`)}
                        disabled={isLoading}
                        className="p-3 flex items-center justify-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
                    >
                        <CodeBracketIcon className='h-5 w-5 mx-2'/>
                        Refactor Code
                    </button>
                </div>

                <div className="mt-4">
                    <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Or, ask a custom question:</h3>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="e.g., How can I add error handling to this code?"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomPromptSubmit()}
                            className="flex-grow p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleCustomPromptSubmit}
                            disabled={isLoading || !customPrompt.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-500"
                        >
                            Ask
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
                        <p className="text-gray-600 dark:text-gray-400">Select a prompt or enter a custom one to analyze this snippet.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
                        <XMarkIcon className="h-5 w-5" />
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SnippetAiModal;