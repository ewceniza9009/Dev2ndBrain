import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { githubService } from '../services/githubService';
import type { Snippet } from '../types';

interface SnippetState {
  snippets: Snippet[];
  isLoading: boolean;
  fetchSnippets: () => Promise<void>;
  addSnippet: (newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Snippet | undefined>;
  updateSnippet: (id: number, updatedContent: Partial<Snippet>) => Promise<void>;
  deleteSnippet: (id: number) => Promise<void>;
  syncSnippetToGist: (snippetId: number) => Promise<void>;
  importFromGists: () => Promise<void>;
  pullFromGist: (snippetId: number) => Promise<void>;
  pushToGist: (snippetId: number) => Promise<void>;
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
    return createdSnippet;
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
            
            // To get the content, we may need to fetch the full Gist
            const fullGist = await githubService.getGist(gist.id);
            const fullFirstFile = Object.values(fullGist.files)[0] as any;
            
            if (fullFirstFile && fullFirstFile.content) {
                await get().addSnippet({
                    title: fullGist.description || fullFirstFile.filename || 'Untitled Gist',
                    language: (fullFirstFile.language || 'plaintext').toLowerCase(),
                    code: fullFirstFile.content,
                    tags: ['imported'],
                    gistId: fullGist.id,
                });
                importCount++;
            }
        }
        
        if (importCount > 0) {
            get().fetchSnippets();
            alert(`Successfully imported ${importCount} new snippets!`);
        } else {
            alert("No new gists to import.");
        }
    } catch (error) {
        console.error("Gist import failed:", error);
        alert("Failed to import snippets from Gists.");
    }
  },

  pullFromGist: async (snippetId: number) => {
    const snippet = get().snippets.find(s => s.id === snippetId);
    if (!snippet?.gistId) throw new Error("Snippet is not linked to a Gist.");

    try {
      const gist = await githubService.getGist(snippet.gistId);
      const firstFile = Object.values(gist.files)[0] as any;
      if (!firstFile) throw new Error("Gist has no files.");

      if (firstFile.content !== snippet.code) {
        if (window.confirm("Remote Gist has changes. Overwrite your local snippet?")) {
          await get().updateSnippet(snippetId, { code: firstFile.content, title: gist.description });
          alert("Snippet updated from Gist!");
        }
      } else {
        alert("Local snippet is already up-to-date.");
      }
    } catch (error) {
      console.error("Gist pull failed:", error);
      alert("Failed to pull changes from Gist.");
    }
  },

  pushToGist: async (snippetId: number) => {
    const snippet = get().snippets.find(s => s.id === snippetId);
    if (!snippet?.gistId) throw new Error("Snippet is not linked to a Gist.");

    try {
      await githubService.updateGist(snippet);
      alert("Snippet successfully pushed to Gist!");
    } catch (error) {
      console.error("Gist push failed:", error);
      alert("Failed to push changes to Gist.");
    }
  },
}));