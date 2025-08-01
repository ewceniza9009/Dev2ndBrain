import React from 'react';

const GitHubLoginButton: React.FC = () => {
  const handleLogin = () => {
    // This value should be in your .env.local file (VITE_GITHUB_CLIENT_ID)
    const clientId = "your-client-id-from-github";
    const redirectUri = 'http://localhost:5173/oauth/callback';
    const scope = 'read:user gist';
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubOAuthUrl;
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