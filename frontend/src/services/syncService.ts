import { db } from './db';
import { useAuthStore } from '../stores/useAuthStore';
import { searchService } from './searchService';
import type { Deck, Flashcard, Note, Snippet, AiReview, Template, AnnotationRecord } from '../types';

const API_BASE_URL = window.electronAPI
  ? 'https://localhost:7150' // In Electron, talk directly to the backend
  : import.meta.env.VITE_API_BASE_URL; // For web/Docker, use the .env file

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({ message: 'A client-side error occurred.' }));
        throw new Error(`Client Error (${response.status}): ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
      if (i === retries - 1) throw error; // Re-throw the last error
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }
  throw new Error(`Failed to fetch from ${url} after ${retries} attempts.`);
};

const repopulateDb = async (data: {
  notes: Note[],
  snippets: Snippet[],
  decks: Deck[],
  flashcards: Flashcard[],
  aiReviews: AiReview[],
  templates: Template[],
  annotations: AnnotationRecord[],
}) => {
  await db.transaction('rw', [
    db.notes, db.snippets, db.decks, db.flashcards, db.aiReviews, db.templates, db.annotations
  ], async () => {
    await db.notes.clear();
    await db.snippets.clear();
    await db.decks.clear();
    await db.flashcards.clear();
    await db.aiReviews.clear();
    await db.templates.clear();
    await db.annotations.clear();

    await db.notes.bulkAdd(data.notes);
    await db.snippets.bulkAdd(data.snippets);
    await db.decks.bulkAdd(data.decks);
    await db.flashcards.bulkAdd(data.flashcards);
    await db.aiReviews.bulkAdd(data.aiReviews);
    await db.templates.bulkAdd(data.templates);
    await db.annotations.bulkAdd(data.annotations);
  });
  await searchService.initialize();
};

const cleanupLocalTombstones = async () => {
  await db.transaction('rw', [
    db.notes, db.snippets, db.decks, db.flashcards, db.templates
  ], async () => {
    await db.notes.where('isDeleted').equals(1).delete();
    await db.snippets.where('isDeleted').equals(1).delete();
    await db.decks.where('isDeleted').equals(1).delete();
    await db.flashcards.where('isDeleted').equals(1).delete();
    await db.templates.where('isDeleted').equals(1).delete();
  });
  console.log("Local tombstone cleanup complete.");
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
      aiReviews: await db.aiReviews.toArray(),
      templates: await db.templates.toArray(),
      annotations: await db.annotations.toArray(),
    };
    
    console.log("Pushing local data (including deletions) to backend...");
    const pushResponse = await fetchWithRetry(`${API_BASE_URL}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(localData),
    });

    // After a successful push, remove the tombstoned records from the local DB
    await cleanupLocalTombstones();

    return await pushResponse.json();
  },

  async pullAllData() {
    const token = await useAuthStore.getState().getDecryptedToken();
    if (!token) {
      throw new Error("User not authenticated. Cannot pull data.");
    }

    console.log("Pulling data from backend...");
    const pullResponse = await fetchWithRetry(`${API_BASE_URL}/api/sync/pull`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const backendData = await pullResponse.json();
    console.log("Backend data received:", backendData);

    await repopulateDb(backendData);

    return { message: "Data pulled successfully, local database updated." };
  }
};