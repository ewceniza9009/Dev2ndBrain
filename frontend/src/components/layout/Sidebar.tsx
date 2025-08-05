import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import clsx from 'clsx';
import { Squares2X2Icon, BookOpenIcon, CodeBracketSquareIcon, RectangleStackIcon, ShareIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/', icon: <Squares2X2Icon className="h-5 w-5" /> },
  { name: 'Notes', path: '/notes', icon: <BookOpenIcon className="h-5 w-5" /> },
  { name: 'Snippets', path: '/snippets', icon: <CodeBracketSquareIcon className="h-5 w-5" /> },
  { name: 'Flashcards', path: '/flashcards', icon: <RectangleStackIcon className="h-5 w-5" /> },
  { name: 'Graph', path: '/graph', icon: <ShareIcon className="h-5 w-5" /> },
  { name: 'Settings', path: '/settings', icon: <Cog8ToothIcon className="h-5 w-5" /> },
];

const Sidebar: React.FC = () => {
  const { theme, toggleTheme, isSidebarCollapsed, setActiveTab, activeTabId } = useAppStore();
  const activeClassName = "text-white bg-teal-600";
  const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";

  const handleNavClick = () => {
    setActiveTab(null);
  };

  return (
    <aside className={clsx(
      "z-20 flex-shrink-0 hidden h-full overflow-y-auto bg-white dark:bg-gray-800 shadow-xl md:block transition-all duration-300",
      isSidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className="py-4 text-gray-500 dark:text-gray-400 flex flex-col h-full">
        <div className={clsx("flex items-center mb-4", isSidebarCollapsed ? "justify-center" : "ml-6")}>
          <img src="/dev2ndbrain.png" alt="Dev2ndBrain Logo" className="h-8 w-auto" />
          {!isSidebarCollapsed && (
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200 ml-2">
              Dev2ndBrain
            </span>
          )}
        </div>
        <ul className="flex-grow">
          {navItems.map((item) => (
            <li className="relative px-2 my-1" key={item.name} onClick={handleNavClick}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "inline-flex items-center w-full px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg",
                    { [activeClassName]: isActive && activeTabId === null, [inactiveClassName]: !isActive || activeTabId !== null }
                  )
                }
              >
                <div className="flex items-center justify-center w-6">
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={clsx("mt-4", isSidebarCollapsed ? "px-2" : "px-6")}>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 transition-colors duration-150 rounded-lg focus:outline-none"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <span className="text-gray-700 dark:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </span>
            ) : (
              <span className="text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            )}
            {!isSidebarCollapsed && <span className="ml-2">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;