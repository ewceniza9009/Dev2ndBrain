import { create } from 'zustand';

type Theme = 'light' | 'dark';

export interface Tab {
  id: string; // e.g., "note-1", "snippet-5", "graph-filter-react"
  type: 'note' | 'snippet' | 'deck' | 'graph-filter'; // Added 'graph-filter'
  entityId?: number; // Made optional as it doesn't apply to graph filters
  title: string;
  filterCriteria?: string; // New property to store the tag for filtering
}

interface AppState {
  theme: Theme;
  isCommandPaletteOpen: boolean;
  isSidebarCollapsed: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  initTheme: () => void;
  toggleTheme: () => void;
  toggleCommandPalette: () => void;
  toggleSidebar: () => void;
  openTab: (tabInfo: Omit<Tab, 'id'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  isCommandPaletteOpen: false,
  isSidebarCollapsed: false,
  tabs: [],
  activeTabId: null,

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
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
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

  setActiveTab: (tabId: string | null) => {
    set({ activeTabId: tabId });
  },

  openTab: (tabInfo: Omit<Tab, 'id'>) => {
    // Generate a unique ID based on the tab type and its content identifier
    const newTabId = tabInfo.type === 'graph-filter'
        ? `${tabInfo.type}-${tabInfo.filterCriteria}`
        : `${tabInfo.type}-${tabInfo.entityId}`;

    const existingTab = get().tabs.find(t => t.id === newTabId);

    if (existingTab) {
      set({ activeTabId: existingTab.id });
    } else {
      const newTab: Tab = { ...tabInfo, id: newTabId };
      set(state => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      }));
    }
  },

  closeTab: (tabId: string) => {
    set(state => {
      const tabIndex = state.tabs.findIndex(t => t.id === tabId);
      if (tabIndex === -1) return {};

      const newTabs = state.tabs.filter(t => t.id !== tabId);
      let newActiveTabId = state.activeTabId;

      if (state.activeTabId === tabId) {
        if (newTabs.length === 0) {
          newActiveTabId = null;
        } else {
          newActiveTabId = newTabs[Math.max(0, tabIndex - 1)].id;
        }
      }

      return { tabs: newTabs, activeTabId: newActiveTabId };
    });
  },
}));