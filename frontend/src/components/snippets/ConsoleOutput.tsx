import React from 'react';

interface ConsoleOutputProps {
  output: string;
  isLoading: boolean;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, isLoading }) => {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-b-lg p-4 bg-gray-100 dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Console Output</h3>
      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">Running...</p>
      ) : (
        <pre className="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
          {output || 'No output yet. Click "Run C#" to execute.'}
        </pre>
      )}
    </div>
  );
};

export default ConsoleOutput;