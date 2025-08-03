import React, { useState } from 'react';
import type { Snippet } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7150';

interface SnippetAiModalProps {
    isOpen: boolean;
    onClose: () => void;
    snippet: Snippet | null;
}

const SnippetAiModal: React.FC<SnippetAiModalProps> = ({ isOpen, onClose, snippet }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    if (!isOpen || !snippet) return null;

    const handlePromptClick = async (action: 'explain' | 'refactor') => {
        setIsLoading(true);
        setResponse('');
        try {
            const url = action === 'explain'
                ? `${API_BASE_URL}/api/ai/code-explain`
                : `${API_BASE_URL}/api/ai/code-refactor`;

            const requestBody = {
                code: snippet.code,
                language: snippet.language
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant for Snippet: {snippet.title}</h2>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={() => handlePromptClick('explain')}
                        disabled={isLoading}
                        className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-500"
                    >
                        Explain Code
                    </button>
                    <button
                        onClick={() => handlePromptClick('refactor')}
                        disabled={isLoading}
                        className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-500"
                    >
                        Refactor Code
                    </button>
                </div>

                <div className="w-full p-4 h-64 overflow-y-auto bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
                    {isLoading ? 'Thinking...' : (response || 'Select a prompt to analyze this snippet.')}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SnippetAiModal;