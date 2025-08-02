import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CommandPalette from '../common/CommandPalette'; 
import { useAppStore } from '../../stores/useAppStore'; 

const Layout: React.FC = () => {
  const toggleCommandPalette = useAppStore((state) => state.toggleCommandPalette);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleCommandPalette]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="h-full overflow-y-auto bg-white dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
      {/* Render the Command Palette */}
      <CommandPalette />
    </div>
  );
};

export default Layout;