import Dexie, { type Table } from 'dexie';
import type { Note, Snippet, Flashcard, Deck, GitHubUser, EncryptedData } from '../types';

class AppDatabase extends Dexie {
  notes!: Table<Note, number>;
  snippets!: Table<Snippet, number>;
  flashcards!: Table<Flashcard, number>;
  decks!: Table<Deck, number>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('Dev2ndBrainDB');
    this.version(1).stores({
      notes: '++id, uuid, title, *tags, createdAt, updatedAt',
      snippets: '++id, title, language, *tags, gistId',
      flashcards: '++id, deckId, nextReview',
      decks: '++id, name',
      settings: 'key',
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