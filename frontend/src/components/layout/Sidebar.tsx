// frontend/src/components/layout/Sidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import clsx from 'clsx'; // Utility for conditional classes

const navItems = [
  { name: 'Dashboard', path: '/', icon: '🏠' },
  { name: 'Notes', path: '/notes', icon: '📝' },
  { name: 'Snippets', path: '/snippets', icon: '💻' },
  { name: 'Flashcards', path: '/flashcards', icon: '📇' },
  { name: 'Graph', path: '/graph', icon: '🔗' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
];

const Sidebar: React.FC = () => {
  const { theme, toggleTheme, isSidebarCollapsed } = useAppStore();
  const activeClassName = "text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700";
  const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <aside className={clsx(
      "z-20 flex-shrink-0 hidden h-full overflow-y-auto bg-gray-100 dark:bg-gray-800 md:block transition-all duration-300",
      isSidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className="py-4 text-gray-500 dark:text-gray-400 flex flex-col h-full">
        <div className={clsx("flex items-center", isSidebarCollapsed ? "justify-center" : "ml-6")}>
          <img src="/dev2ndbrain.png" alt="Dev2ndBrain Logo" className="h-8 mr-2" />
          {!isSidebarCollapsed && (
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Dev2ndBrain
            </span>
          )}
        </div>
        <ul className="mt-6 flex-grow">
          {navItems.map((item) => (
            <li className="relative px-4" key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `inline-flex items-center w-full px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg ${isActive ? activeClassName : inactiveClassName}`
                }
              >
                <span className={clsx("text-lg", !isSidebarCollapsed && "mr-3")}>{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className={clsx("flex justify-center", isSidebarCollapsed ? "px-2 my-2" : "px-6 my-2")}>
          <img src="/dev2ndbrain.png" alt="Dev2ndBrain Logo" className={clsx("w-auto", isSidebarCollapsed ? "h-16" : "h-34")} />
        </div>
        <div className={clsx("my-2", isSidebarCollapsed ? "px-2" : "px-6")}>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-teal-600 border border-transparent rounded-lg active:bg-teal-600 hover:bg-teal-700 focus:outline-none focus:shadow-outline-teal"
          >
            <span className={clsx(isSidebarCollapsed && "sr-only")}>
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </span>
            <span className={clsx("ml-0", !isSidebarCollapsed && "ml-2")}>{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;