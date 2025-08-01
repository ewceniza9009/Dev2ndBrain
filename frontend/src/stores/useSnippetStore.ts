import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import type { Snippet } from '../types';

interface SnippetState {
  snippets: Snippet[];
  isLoading: boolean;
  fetchSnippets: () => Promise<void>;
  addSnippet: (newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: number, updatedContent: Partial<Snippet>) => Promise<void>;
  deleteSnippet: (id: number) => Promise<void>;
}

export const useSnippetStore = create<SnippetState>((set) => ({
  snippets: [],
  isLoading: true,

  fetchSnippets: async () => {
    set({ isLoading: true });
    const snippets = await db.snippets.toArray();
    set({ snippets, isLoading: false });
  },

  addSnippet: async (newSnippetData) => {
    const now = new Date();
    const snippet: Snippet = {
      ...newSnippetData,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.snippets.add(snippet);
    const createdSnippet = { ...snippet, id };
    
    set((state) => ({ snippets: [...state.snippets, createdSnippet] }));
    searchService.add(createdSnippet, 'snippet');
  },

  updateSnippet: async (id, updatedContent) => {
    await db.snippets.update(id, { ...updatedContent, updatedAt: new Date() });
    const updatedSnippet = await db.snippets.get(id);

    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? { ...s, ...updatedContent, updatedAt: new Date() } : s)),
    }));
    if(updatedSnippet) {
      searchService.add(updatedSnippet, 'snippet');
    }
  },

  deleteSnippet: async (id) => {
    await db.snippets.delete(id);
    set((state) => ({
      snippets: state.snippets.filter((s) => s.id !== id),
    }));
    searchService.remove(id, 'snippet');
  },
}));