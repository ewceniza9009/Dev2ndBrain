import Dexie, { type Table } from 'dexie';
import type { Note, Snippet, Flashcard, Deck, GitHubUser, EncryptedData, Template, AiReview } from '../types';

class AppDatabase extends Dexie {
  notes!: Table<Note, number>;
  snippets!: Table<Snippet, number>;
  flashcards!: Table<Flashcard, number>;
  decks!: Table<Deck, number>;
  templates!: Table<Template, number>;
  settings!: Table<{ key: string; value: any }, string>;
  aiReviews!: Table<AiReview, number>;

  constructor() {
    super('Dev2ndBrainDB');
    // VITAL CHANGE: Increment version number to apply schema changes
    this.version(6).stores({  
      // VITAL CHANGE: Add 'isDeleted' as an index to all relevant tables
      notes: '++id, uuid, title, *tags, updatedAt, isDeleted', 
      snippets: '++id, title, language, *tags, gistId, updatedAt, isDeleted',
      flashcards: '++id, deckId, nextReview, isDeleted',
      decks: '++id, name, isDeleted',
      templates: '++id, title, isDeleted',
      settings: 'key',
      aiReviews: '++id, deckId, timestamp', 
    });
  }

  async getGitHubToken(): Promise<EncryptedData | null> {
    const setting = await this.settings.get('githubAuthToken');
    return setting ? (setting.value as EncryptedData) : null;
  }

  async setGitHubToken(token: EncryptedData): Promise<void> {
    await this.settings.put({ key: 'githubAuthToken', value: token });
  }

  async deleteGitHubToken(): Promise<void> {
    await this.settings.delete('githubAuthToken');
  }

  async getGitHubUser(): Promise<GitHubUser | null> {
      const setting = await this.settings.get('githubUser');
      return setting ? (setting.value as GitHubUser) : null;
  }

  async setGitHubUser(user: GitHubUser): Promise<void> {
    await this.settings.put({ key: 'githubUser', value: user });
  }

  async deleteGitHubUser(): Promise<void> {
    await this.settings.delete('githubUser');
  }
}

export const db = new AppDatabase();