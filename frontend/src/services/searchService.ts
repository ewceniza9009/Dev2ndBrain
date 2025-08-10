import MiniSearch from 'minisearch';
import { db } from './db';
import type { Note, Snippet, Deck, SearchDocument, Project } from '../types';

export const searchService = {
  miniSearch: new MiniSearch<SearchDocument>({
    fields: ['title', 'content', 'tags'],
    storeFields: ['title', 'type', 'deckId', 'tags'],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  }),

  async initialize() {
    this.miniSearch.removeAll();
    const notes = await db.notes.toArray();
    const snippets = await db.snippets.toArray();
    const decks = await db.decks.toArray();
    const projects = await db.projects.toArray();

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
      ...decks.map(deck => ({
        id: `flashcard-${deck.id!}`,
        type: 'flashcard' as const,
        title: deck.name,
        tags: [], 
        deckId: deck.id!
      })),
      ...projects.map(project => ({
        id: `project-${project.id!}`,
        type: 'project' as const,
        title: project.title,
        content: project.description,
        tags: [],
      })),
    ];

    await this.miniSearch.addAllAsync(documents);
  },

  add(document: Note | Snippet | Deck | Project, type: 'note' | 'snippet' | 'flashcard' | 'project') {
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
    } else if (type === 'project') {
        const projectDoc = document as Project;
        doc = {
            id: `${type}-${projectDoc.id!}`,
            type: type,
            title: projectDoc.title,
            content: projectDoc.description,
            tags: [],
        };
    } else { // flashcard (deck)
      const deckDoc = document as Deck;
      doc = {
        id: `flashcard-${deckDoc.id!}`,
        type: 'flashcard',
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

  remove(id: number, type: 'note' | 'snippet' | 'flashcard' | 'project') {
    this.miniSearch.discard(`${type}-${id}`);
  },

  search(query: string) {
    let textQuery = query;
    let typeFilter: string | null = null;
    let tagFilter: string | null = null;

    const typeRegex = /type:(\w+)/;
    const typeMatch = textQuery.match(typeRegex);
    if (typeMatch) {
      typeFilter = typeMatch[1].toLowerCase();
      textQuery = textQuery.replace(typeRegex, '').trim();
    }

    const tagRegex = /#(\w+)/;
    const tagMatch = textQuery.match(tagRegex);
    if (tagMatch) {
      tagFilter = tagMatch[1].toLowerCase();
      textQuery = textQuery.replace(tagRegex, '').trim();
    }
    
    return this.miniSearch.search(textQuery, {
      filter: (result) => {
        let typeMatch = true;
        let tagMatch = true;

        if (typeFilter) {
          typeMatch = result.type.toLowerCase() === typeFilter;
        }

        if (tagFilter && result.tags) {
          // VITAL CHANGE: Explicitly type 'tag' as a string to fix the error.
          tagMatch = result.tags.some((tag: string) => tag.toLowerCase() === tagFilter);
        }
        
        return typeMatch && tagMatch;
      }
    });
  },
};

searchService.initialize();