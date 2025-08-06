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
    // Increment version for migration
    this.version(5).stores({  
      notes: '++id, uuid, title, *tags, createdAt, updatedAt, iconType, iconColor, x, y, fx, fy',  
      snippets: '++id, title, language, *tags, gistId',
      flashcards: '++id, deckId, nextReview',
      decks: '++id, name',
      templates: '++id, title',
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