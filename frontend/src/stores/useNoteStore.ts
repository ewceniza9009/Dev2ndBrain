import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import type { Note } from '../types';

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  fetchNotes: () => Promise<void>;
  getNoteById: (id: number) => Note | undefined;
  addNote: (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'uuid' | 'linkedNoteIds'>) => Promise<Note>;
  updateNote: (id: number, updatedContent: Partial<Note>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: true,

  fetchNotes: async () => {
    set({ isLoading: true });
    const notes = await db.notes.toArray();
    set({ notes, isLoading: false });
  },

  getNoteById: (id: number) => {
    return get().notes.find(note => note.id === id);
  },

  addNote: async (newNoteData) => {
    const now = new Date();
    const note: Note = {
      ...newNoteData,
      uuid: crypto.randomUUID(),
      linkedNoteIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.notes.add(note);
    const createdNote = { ...note, id };
    
    set((state) => ({ notes: [...state.notes, createdNote] }));
    searchService.add(createdNote, 'note');
    return createdNote;
  },

  updateNote: async (id, updatedContent) => {
    const now = new Date();
    await db.notes.update(id, { ...updatedContent, updatedAt: now });
    const updatedNote = await db.notes.get(id);

    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? { ...note, ...updatedContent, updatedAt: now } : note)),
    }));
    if (updatedNote) {
      searchService.add(updatedNote, 'note');
    }
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
    searchService.remove(id, 'note');
  },
}));