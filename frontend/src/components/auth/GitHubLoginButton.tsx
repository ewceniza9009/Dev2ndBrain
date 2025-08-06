// frontend/src/components/auth/GitHubLoginButton.tsx

import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const GitHubLoginButton: React.FC = () => {
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.electronAPI) {
            const handleSuccess = (code: string) => {
                login(code)
                    .then(() => navigate('/'))
                    .catch((err) => {
                        console.error('Failed to log in:', err);
                    });
            };
            const handleFailure = (error: string) => {
                console.error('OAuth failed:', error);
            };

            window.electronAPI.onOAuthSuccess(handleSuccess);
            window.electronAPI.onOAuthFailure(handleFailure);
            
            return () => {
                window.electronAPI.offOAuthSuccess(handleSuccess);
                window.electronAPI.offOAuthFailure(handleFailure);
            };
        }
    }, [login, navigate]);

    const handleLogin = () => {
        if (window.electronAPI) {
            window.electronAPI.githubOAuthLogin();
        } else {
            const clientId = import.meta.env.VITE_CLIENT_ID;
            const redirectUri = import.meta.env.VITE_REDIRECT_CALLBACK_URL;
            const scope = import.meta.env.VITE_GIST_SCOPE;
            const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
            window.location.href = githubOAuthUrl;
        }
    };

    return (
        <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-teal-600 border border-transparent rounded-lg active:bg-teal-600 hover:bg-teal-700 focus:outline-none focus:shadow-outline-teal"
        >
            Login with GitHub
        </button>
    );
};

export default GitHubLoginButton;