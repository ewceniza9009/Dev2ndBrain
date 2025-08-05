import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import clsx from 'clsx';
import { XMarkIcon, HomeIcon } from '@heroicons/react/20/solid';
import TabContentRenderer from './TabContentRenderer';
import ScrollToTopButton from '../common/ScrollToTopButton';

const TabContainer: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAppStore();
  const location = useLocation();
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const mainPageTitleMap: { [key: string]: string } = {
    '/': 'Dashboard',
    '/notes': 'Notes',
    '/snippets': 'Snippets',
    '/flashcards': 'Flashcards',
    '/graph': 'Graph',
    '/settings': 'Settings',
  };
  
  const mainPageTitle = mainPageTitleMap[location.pathname] || 'Page';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab(null)}
            className={clsx(
              'flex items-center group px-3 py-2 text-sm font-medium rounded-t-lg',
              activeTabId === null
                ? 'bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            {mainPageTitle}
          </button>

          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-t-lg',
                tab.id === activeTabId
                  ? 'bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <span className="truncate max-w-32">{tab.title}</span>
              <XMarkIcon
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="w-5 h-5 ml-2 text-gray-400 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              />
            </button>
          ))}
        </nav>
      </div>

      <div ref={scrollableContainerRef} className="flex-grow overflow-auto relative">
        {activeTabId === null ? (
          <Outlet />
        ) : (
          <TabContentRenderer key={activeTabId} tabId={activeTabId} />
        )}
        <ScrollToTopButton scrollableElementRef={scrollableContainerRef} />
      </div>
    </div>
  );
};

export default TabContainer;