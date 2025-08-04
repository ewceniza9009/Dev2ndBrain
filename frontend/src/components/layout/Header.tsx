// frontend/src/components/layout/Header.tsx

import React from 'react';
import { useAuthStore, type AuthState } from '../../stores/useAuthStore';
import GitHubLoginButton from '../auth/GitHubLoginButton';
import SearchBar from '../common/SearchBar';
import clsx from 'clsx';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const user = useAuthStore((state: AuthState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center h-full px-6 mx-auto">
        {/* NEW: Collapse/expand button for desktop */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 focus:outline-none focus:text-gray-600 hidden md:block"
        >
          <svg
            className={clsx('h-6 w-6 transform transition-transform duration-300', {
              'rotate-180': isSidebarCollapsed,
            })}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
        <ul className="flex items-center flex-shrink-0 ml-auto pl-6">
          <li className="relative">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <img className="object-cover w-8 h-8 rounded-full" src={user.avatarUrl} alt="User Avatar" />
                <span className="text-gray-700 dark:text-gray-200">{user.name || user.login}</span>
              </div>
            ) : (
              <GitHubLoginButton />
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;