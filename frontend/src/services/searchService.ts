import MiniSearch from 'minisearch';
import { db } from './db';
import type { Note, Snippet, Deck, SearchDocument } from '../types';

export const searchService = {
  miniSearch: new MiniSearch<SearchDocument>({
    fields: ['title', 'content', 'tags'],
    storeFields: ['title', 'type', 'deckId'],
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
    const decks = await db.decks.toArray();

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
      // MODIFIED: Index decks by their title
      ...decks.map(deck => ({
        id: `flashcard-${deck.id!}`,
        type: 'flashcard' as const,
        title: deck.name,
        tags: [],
        deckId: deck.id!
      })),
    ];

    await this.miniSearch.addAllAsync(documents);
  },

  add(document: Note | Snippet | Deck, type: 'note' | 'snippet' | 'flashcard') {
    let doc: SearchDocument;

    if (type === 'note') {
      const noteDoc = document as Note;
      doc = {
        id: `${type}-${noteDoc.id!}`,
        type: type,
        title: noteDoc.title,
        content: noteDoc.content,
        tags: noteDoc.tags,
      };
    } else if (type === 'snippet') {
      const snippetDoc = document as Snippet;
      doc = {
        id: `${type}-${snippetDoc.id!}`,
        type: type,
        title: snippetDoc.title,
        content: snippetDoc.code,
        tags: snippetDoc.tags,
      };
    } else { // flashcard
      const deckDoc = document as Deck;
      doc = {
        id: `${type}-${deckDoc.id!}`,
        type: type,
        title: deckDoc.name,
        tags: [],
        deckId: deckDoc.id!
      };
    }

    if(this.miniSearch.has(doc.id)) {
      this.miniSearch.replace(doc);
    } else {
      this.miniSearch.add(doc);
    }
  },

  remove(id: number, type: 'note' | 'snippet' | 'flashcard') {
    this.miniSearch.discard(`${type}-${id}`);
  },

  search(query: string) {
    return this.miniSearch.search(query);
  },
};

searchService.initialize();