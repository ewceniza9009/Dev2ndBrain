import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const OAuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
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
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>Authenticating with GitHub...</div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;