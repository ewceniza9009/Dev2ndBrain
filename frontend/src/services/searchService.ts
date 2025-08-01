import MiniSearch from 'minisearch';
import { db } from './db';
import type { Note, Snippet } from '../types';

interface SearchDocument {
  id: string;
  type: 'note' | 'snippet';
  title: string;
  content: string;
  tags: string[];
}

export const searchService = {
  miniSearch: new MiniSearch<SearchDocument>({
    fields: ['title', 'content', 'tags'],
    storeFields: ['title', 'type'],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  }),

  async initialize() {
    this.miniSearch.removeAll(); // Add this line to clear the index
    const notes = await db.notes.toArray();
    const snippets = await db.snippets.toArray();

    const documents: SearchDocument[] = [
      ...notes.map(note => ({
        id: `note-${note.id!}`,
        type: 'note' as const,
        title: note.title,
        content: note.content,
        tags: note.tags,
      })),
      ...snippets.map(snippet => ({
        id: `snippet-${snippet.id!}`,
        type: 'snippet' as const,
        title: snippet.title,
        content: snippet.code,
        tags: snippet.tags,
      })),
    ];

    await this.miniSearch.addAllAsync(documents);
  },

  add(document: Note | Snippet, type: 'note' | 'snippet') {
    const doc: SearchDocument = {
      id: `${type}-${document.id}`,
      type: type,
      title: document.title,
      content: type === 'note' ? (document as Note).content : (document as Snippet).code,
      tags: document.tags,
    };
    if(this.miniSearch.has(doc.id)) {
      this.miniSearch.replace(doc);
    } else {
      this.miniSearch.add(doc);
    }
  },

  remove(id: number, type: 'note' | 'snippet') {
    this.miniSearch.discard(`${type}-${id}`);
  },

  search(query: string) {
    return this.miniSearch.search(query);
  },
};

searchService.initialize();