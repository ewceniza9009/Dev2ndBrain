import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { githubService } from '../services/githubService';
import type { Snippet } from '../types';

interface SnippetState {
  snippets: Snippet[];
  isLoading: boolean;
  fetchSnippets: () => Promise<void>;
  addSnippet: (newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: number, updatedContent: Partial<Snippet>) => Promise<void>;
  deleteSnippet: (id: number) => Promise<void>;
  syncSnippetToGist: (snippetId: number) => Promise<void>;
  importFromGists: () => Promise<void>;
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
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
    const now = new Date();
    await db.snippets.update(id, { ...updatedContent, updatedAt: now });
    const updatedSnippet = { ...get().snippets.find(s => s.id === id)!, ...updatedContent, updatedAt: now };

    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? updatedSnippet : s)),
    }));
    searchService.add(updatedSnippet, 'snippet');
  },

  deleteSnippet: async (id) => {
    await db.snippets.delete(id);
    set((state) => ({
      snippets: state.snippets.filter((s) => s.id !== id),
    }));
    searchService.remove(id, 'snippet');
  },

  syncSnippetToGist: async (snippetId: number) => {
    const snippet = get().snippets.find(s => s.id === snippetId);
    if (!snippet) throw new Error("Snippet not found.");

    try {
      const { gistId } = await githubService.createGist(snippet);
      await get().updateSnippet(snippetId, { gistId });
      alert("Snippet successfully synced to Gist!");
    } catch (error) {
      console.error("Gist sync failed:", error);
      alert("Failed to sync snippet to Gist.");
    }
  },

  importFromGists: async () => {
    try {
        const gists = await githubService.importGists();
        const existingGistIds = new Set(get().snippets.map(s => s.gistId).filter(Boolean));
        let importCount = 0;

        for (const gist of gists) {
            if (existingGistIds.has(gist.id)) continue;

            const firstFile = Object.values(gist.files)[0] as any;
            if (!firstFile) continue;

            await get().addSnippet({
                title: gist.description || firstFile.filename || 'Untitled Gist',
                language: (firstFile.language || 'plaintext').toLowerCase(),
                code: firstFile.content,
                tags: ['imported'],
                gistId: gist.id,
            });
            importCount++;
        }
        alert(`Successfully imported ${importCount} new snippets!`);
    } catch (error) {
        console.error("Gist import failed:", error);
        alert("Failed to import snippets from Gists.");
    }
  }
}));