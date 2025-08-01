import React from 'react';
import { useAuthStore, type AuthState } from '../../stores/useAuthStore';
import GitHubLoginButton from '../auth/GitHubLoginButton';
import SearchBar from '../common/SearchBar';

const Header: React.FC = () => {
  const user = useAuthStore((state: AuthState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center h-full px-6 mx-auto">
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