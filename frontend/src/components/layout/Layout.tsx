import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CommandPalette from '../common/CommandPalette';
import { useAppStore } from '../../stores/useAppStore';

const Layout: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, toggleCommandPalette } = useAppStore();

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
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

export default Layout;