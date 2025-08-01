import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Notes', path: '/notes/1' },
    { name: 'Snippets', path: '/snippets' },
    { name: 'Flashcards', path: '/flashcards' },
    { name: 'Graph', path: '/graph' },
    { name: 'Settings', path: '/settings' },
  ];

  const activeClassName = "text-gray-800 dark:text-gray-100 border-l-4 border-purple-600";
  const inactiveClassName = "text-gray-600 dark:text-gray-400";

  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <NavLink to="/" className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">
          Dev2ndBrain
        </NavLink>
        <ul className="mt-6">
          {navItems.map((item) => (
            <li className="relative px-2 py-1" key={item.name}>
               <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `inline-flex items-center w-full px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg hover:text-gray-800 dark:hover:text-gray-200 ${isActive ? activeClassName : inactiveClassName}`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;