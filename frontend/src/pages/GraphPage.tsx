import React from 'react';
import GraphView from '../components/graph/GraphView';

const GraphPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Note Graph</h1>
        <div className="h-[calc(100%-4rem)] w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <GraphView />
        </div>
    </div>
  );
};

export default GraphPage;