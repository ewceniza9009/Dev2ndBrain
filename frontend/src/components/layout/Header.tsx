import React from 'react';
import { useAuthStore, type AuthState } from '../../stores/useAuthStore'; // Corrected import
import GitHubLoginButton from '../auth/GitHubLoginButton';

const Header: React.FC = () => {
  const user = useAuthStore((state: AuthState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  return (
    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex items-center justify-end h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        <ul className="flex items-center flex-shrink-0 space-x-6">
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