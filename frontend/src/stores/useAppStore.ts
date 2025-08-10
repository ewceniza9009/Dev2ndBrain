import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

export interface Tab {
    id: string;
    type: 'note' | 'snippet' | 'deck' | 'project' | 'graph-filter';
    entityId?: number;
    title: string;
    filterCriteria?: string;
}

interface AppState {
    theme: Theme;
    isCommandPaletteOpen: boolean;
    isSidebarCollapsed: boolean;
    tabs: Tab[];
    activeTabId: string | null;
    toggleTheme: () => void;
    toggleCommandPalette: () => void;
    toggleSidebar: () => void;
    openTab: (tabInfo: Omit<Tab, 'id'>) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string | null) => void;
}

// Wrap the entire store creation with the `persist` middleware
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isCommandPaletteOpen: false,
      isSidebarCollapsed: false,
      tabs: [],
      activeTabId: null,

      toggleTheme: () => {
        set(state => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return { theme: newTheme };
        });
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
    }),
    {
      // Configuration for the persist middleware
      name: 'dev2ndbrain-app-storage', // The key to use in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // Only persist the theme and tab information, ignore transient UI state
      partialize: (state) => ({
        theme: state.theme,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
      // This function runs after the state has been loaded from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
            // Apply the theme immediately on app load
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
      },
    }
  )
);