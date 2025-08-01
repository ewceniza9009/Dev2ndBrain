import React from 'react';

const GraphPage: React.FC = () => {
  return (
    <div className="h-full">
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Note Graph</h1>
      <div className="mt-4 p-4 h-[80vh] bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <p>The interactive D3.js force-directed graph for visualizing note links will be rendered here.</p>
      </div>
    </div>
  );
};

export default GraphPage;