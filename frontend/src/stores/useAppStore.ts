// frontend/src/stores/useAppStore.ts

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface AppState {
  theme: Theme;
  isCommandPaletteOpen: boolean;
  isSidebarCollapsed: boolean; // NEW: State for sidebar
  initTheme: () => void;
  toggleTheme: () => void;
  toggleCommandPalette: () => void;
  toggleSidebar: () => void; // NEW: Function to toggle sidebar
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  isCommandPaletteOpen: false,
  isSidebarCollapsed: false, // NEW: Initial state is not collapsed

  initTheme: () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    set({ theme: initialTheme });

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleCommandPalette: () => {
    set(state => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen }));
  },

  toggleSidebar: () => {
    set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },
}));