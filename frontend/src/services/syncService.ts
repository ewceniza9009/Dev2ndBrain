import { db } from './db';
import { useAuthStore } from '../stores/useAuthStore';
import { searchService } from './searchService';
import type { Deck, Flashcard, Note, Snippet } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7150';

const repopulateDb = async (data: { notes: Note[], snippets: Snippet[], decks: Deck[], flashcards: Flashcard[] }) => {
  await db.transaction('rw', db.notes, db.snippets, db.decks, db.flashcards, async () => {
    // Clear all local tables
    await db.notes.clear();
    await db.snippets.clear();
    await db.decks.clear();
    await db.flashcards.clear();

    // Add the fetched data back into the tables
    await db.notes.bulkAdd(data.notes);
    await db.snippets.bulkAdd(data.snippets);
    await db.decks.bulkAdd(data.decks);
    await db.flashcards.bulkAdd(data.flashcards);
  });
  await searchService.initialize();
};

export const syncService = {
  async pushAllData() {
    const token = await useAuthStore.getState().getDecryptedToken();
    if (!token) {
      throw new Error("User not authenticated. Cannot push data.");
    }
    
    const localData = {
      notes: await db.notes.toArray(),
      snippets: await db.snippets.toArray(),
      decks: await db.decks.toArray(),
      flashcards: await db.flashcards.toArray(),
    };
    
    console.log("Pushing local data to backend...");
    const pushResponse = await fetch(`${API_BASE_URL}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(localData),
    });

    if (!pushResponse.ok) {
        const errorData = await pushResponse.json().catch(() => ({ message: 'Failed to push data to backend.' }));
        throw new Error(errorData.message || 'An unknown error occurred during push.');
    }

    return await pushResponse.json();
  },

  async pullAllData() {
    const token = await useAuthStore.getState().getDecryptedToken();
    if (!token) {
      throw new Error("User not authenticated. Cannot pull data.");
    }

    console.log("Pulling data from backend...");
    const pullResponse = await fetch(`${API_BASE_URL}/api/sync/pull`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!pullResponse.ok) {
      const errorData = await pullResponse.json().catch(() => ({ message: 'Failed to pull data from backend.' }));
      throw new Error(errorData.message || 'An unknown error occurred during pull.');
    }
    
    const backendData = await pullResponse.json();
    console.log("Backend data received:", backendData);

    await repopulateDb(backendData);

    return { message: "Data pulled successfully, local database updated." };
  }
};