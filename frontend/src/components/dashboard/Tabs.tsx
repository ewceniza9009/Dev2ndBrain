import React from 'react';
import clsx from 'clsx';
import { SparklesIcon, ChartBarIcon, Squares2X2Icon } from '@heroicons/react/20/solid';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: <Squares2X2Icon className="h-5 w-5" /> },
  { id: 'stats', name: 'Stats', icon: <ChartBarIcon className="h-5 w-5" /> },
  { id: 'reviews', name: 'AI Reviews', icon: <SparklesIcon className="h-5 w-5" /> },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200',
            activeTab === tab.id
              ? 'bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;