import React from 'react';
import { useAuthStore, type AuthState } from '../stores/useAuthStore'; // Corrected import

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state: AuthState) => state.user);
  return (
    <div>
      <h1 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome {user?.name || 'back'} to your Dev2ndBrain! Your central hub for notes, snippets, and knowledge.
      </p>
    </div>
  );
};

export default DashboardPage;