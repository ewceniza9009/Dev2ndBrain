import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Notes', path: '/notes' },
    { name: 'Snippets', path: '/snippets' },
    { name: 'Flashcards', path: '/flashcards' },
    { name: 'Graph', path: '/graph' },
    { name: 'Settings', path: '/settings' },
  ];

  // Updated styles for light/dark active/inactive states
  const activeClassName = "text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700";
  const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <aside className="z-20 flex-shrink-0 hidden w-64 overflow-y-auto bg-gray-100 dark:bg-gray-800 md:block">
      <div className="py-4 text-gray-500 dark:text-gray-400 flex flex-col h-full">
        <NavLink to="/" className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
          <img src="/src/assets/dev2ndbrain.png" alt="Dev2ndBrain Logo" className="h-8 mr-2" />
          Dev2ndBrain
        </NavLink>
        <ul className="mt-6 flex-grow">
          {navItems.map((item) => (
            <li className="relative px-4" key={item.name}>
               <NavLink
               to={item.path}
               className={({ isActive }) =>
                 `inline-flex items-center w-full px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg ${isActive ? activeClassName : inactiveClassName}`
               }
             >
               <span>{item.name}</span>
             </NavLink>
            </li>
          ))}
        </ul>

        {/* This is the new, larger logo above the theme toggle */}
        <div className="flex justify-center px-6 my-2">
          <img src="/src/assets/dev2ndbrain.png" alt="Dev2ndBrain Logo" className="h-34 w-auto" />
        </div>
        <div className="px-6 my-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-teal-600 border border-transparent rounded-lg active:bg-teal-600 hover:bg-teal-700 focus:outline-none focus:shadow-outline-teal"
          >
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            <span className="ml-2">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;