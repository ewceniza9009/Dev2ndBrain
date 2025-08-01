import { db } from './db';
import { useAuthStore } from '../stores/useAuthStore';
import { searchService } from './searchService';
import type { Deck, Flashcard, Note, Snippet } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7150';

const mergeData = <T extends { id?: number; updatedAt?: Date }>(localItems: T[], backendItems: T[]): T[] => {
  const mergedItems = new Map<number, T>();

  for (const item of localItems) {
    if (item.id) {
      mergedItems.set(item.id, item);
    }
  }

  for (const item of backendItems) {
    if (item.id) {
      const existingItem = mergedItems.get(item.id);
      if (!existingItem || (item.updatedAt && existingItem.updatedAt && new Date(item.updatedAt) > new Date(existingItem.updatedAt))) {
        mergedItems.set(item.id, item);
      }
    }
  }

  return Array.from(mergedItems.values());
};

export const syncService = {
  async syncAllData() {
    const token = await useAuthStore.getState().getDecryptedToken();
    if (!token) {
      throw new Error("User not authenticated. Cannot sync.");
    }

    console.log("Pulling data from backend...");
    const pullResponse = await fetch(`${API_BASE_URL}/api/sync/pull`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!pullResponse.ok) {
      const errorData = await pullResponse.json().catch(() => ({ message: 'Failed to pull data from backend.' }));
      throw new Error(errorData.message || 'An unknown error occurred during data pull.');
    }
    
    const backendData = await pullResponse.json();
    console.log("Backend data received:", backendData);

    const localNotes: Note[] = await db.notes.toArray();
    const localSnippets: Snippet[] = await db.snippets.toArray();
    const localDecks: Deck[] = await db.decks.toArray();
    const localFlashcards: Flashcard[] = await db.flashcards.toArray();

    const mergedNotes = mergeData(localNotes, backendData.notes);
    const mergedSnippets = mergeData(localSnippets, backendData.snippets);
    const mergedDecks = mergeData(localDecks, backendData.decks);
    const mergedFlashcards = mergeData(localFlashcards, backendData.flashcards);

    await db.transaction('rw', db.notes, db.snippets, db.decks, db.flashcards, async () => {
      await db.notes.clear();
      await db.snippets.clear();
      await db.decks.clear();
      await db.flashcards.clear();

      await db.notes.bulkAdd(mergedNotes);
      await db.snippets.bulkAdd(mergedSnippets);
      await db.decks.bulkAdd(mergedDecks);
      await db.flashcards.bulkAdd(mergedFlashcards);
    });

    // IMPORTANT: Re-initialize the search service AFTER updating the database
    await searchService.initialize();

    console.log("Pushing merged data to backend...");
    const finalPayload = {
      notes: await db.notes.toArray(),
      snippets: await db.snippets.toArray(),
      decks: await db.decks.toArray(),
      flashcards: await db.flashcards.toArray(),
    };
    
    const pushResponse = await fetch(`${API_BASE_URL}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(finalPayload),
    });

    if (!pushResponse.ok) {
        const errorData = await pushResponse.json().catch(() => ({ message: 'Failed to push data to backend.' }));
        throw new Error(errorData.message || 'An unknown error occurred during sync.');
    }

    return await pushResponse.json();
  },
};