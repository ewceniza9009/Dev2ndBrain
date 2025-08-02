import React from 'react';

interface ConsoleOutputProps {
  output: string;
  isLoading: boolean;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, isLoading }) => {
  return (
    <div className="bg-gray-900 text-white font-mono text-sm p-4 h-48 overflow-y-auto rounded-b-lg">
      <pre>
        {isLoading ? 'Running...' : (output || 'Console output will appear here...')}
      </pre>
    </div>
  );
};

export default ConsoleOutput;