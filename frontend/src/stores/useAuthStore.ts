import { create } from 'zustand';
import { db } from '../services/db';
import { encryptToken, decryptToken } from '../services/cryptoService';
import type { GitHubUser } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  getDecryptedToken: () => Promise<string | null>;
}

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await db.getGitHubToken();
      const storedUser = await db.getGitHubUser();
      if (storedToken && storedUser) {
        set({ isAuthenticated: true, user: storedUser });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
  
  login: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/api/github/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange GitHub code');
    }

    const { accessToken, user } = await response.json();
    const encryptedToken = await encryptToken(accessToken);

    await db.setGitHubToken(encryptedToken);
    await db.setGitHubUser(user);

    set({ isAuthenticated: true, user });
  },

  logout: async () => {
    await db.deleteGitHubToken();
    await db.deleteGitHubUser();
    set({ isAuthenticated: false, user: null });
  },

  getDecryptedToken: async (): Promise<string | null> => {
    const encryptedToken = await db.getGitHubToken();
    if (!encryptedToken) return null;
    try {
      return await decryptToken(encryptedToken);
    } catch (e) {
      console.error("Failed to decrypt token:", e);
      await get().logout();
      return null;
    }
  },
}));