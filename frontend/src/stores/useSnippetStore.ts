import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { githubService } from '../services/githubService';
import type { Snippet } from '../types';

interface SnippetState {
  addSnippet: (newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Snippet | undefined>;
  updateSnippet: (id: number, updatedContent: Partial<Snippet>) => Promise<void>;
  deleteSnippet: (id: number) => Promise<void>;
  syncSnippetToGist: (snippetId: number) => Promise<void>;
  importFromGists: () => Promise<void>;
  pullFromGist: (snippetId: number) => Promise<void>;
  pushToGist: (snippetId: number) => Promise<void>;
}

export const useSnippetStore = create<SnippetState>((_set, get) => ({
  addSnippet: async (newSnippetData) => {
    const now = new Date();
    const snippet: Snippet = {
      ...newSnippetData,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.snippets.add(snippet);
    const createdSnippet = { ...snippet, id };
    searchService.add(createdSnippet, 'snippet');
    return createdSnippet;
  },

  updateSnippet: async (id, updatedContent) => {
    const now = new Date();
    await db.snippets.update(id, { ...updatedContent, updatedAt: now });
    const updatedSnippet = await db.snippets.get(id);

    if (updatedSnippet) {
      searchService.add(updatedSnippet, 'snippet');
    }
  },

  deleteSnippet: async (id) => {
    await db.snippets.update(id, { isDeleted: true, updatedAt: new Date() });
    searchService.remove(id, 'snippet');
  },

  syncSnippetToGist: async (snippetId: number) => {
    const snippet = await db.snippets.get(snippetId);
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
      const allSnippets = await db.snippets.toArray();
      const existingGistIds = new Set(allSnippets.map(s => s.gistId).filter(Boolean));
      let importCount = 0;

      for (const gist of gists) {
        if (existingGistIds.has(gist.id)) continue;

        const firstFile = Object.values(gist.files)[0] as any;
        if (!firstFile) continue;
        
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
    const snippet = await db.snippets.get(snippetId);
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
    const snippet = await db.snippets.get(snippetId);
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