import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const OAuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // This ref will act as a guard to prevent the effect from running twice
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run the logic if it hasn't run before
    if (!hasRun.current) {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (code) {
        login(code)
          .then(() => navigate('/'))
          .catch((err) => {
            console.error(err);
            setError('Failed to log in. Please try again.');
          });
      } else {
        setError('No authorization code found from GitHub.');
      }
      
      // Set the guard to true so this logic doesn't run again
      hasRun.current = true;
    }
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>Authenticating with GitHub...</div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;