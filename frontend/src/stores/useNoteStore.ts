import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { type Note, type Template, IconType, IconColor } from '../types';

interface NoteState {
  notes: Note[];
  templates: Template[]; 
  isLoading: boolean;
  getUniqueTags: () => string[]; // New selector function
  fetchNotes: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => Promise<void>; 
  updateTemplate: (id: number, content: Partial<Template>) => Promise<void>; 
  deleteTemplate: (id: number) => Promise<void>; 
  getNoteById: (id: number) => Note | undefined;
  addNote: (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'uuid' | 'linkedNoteIds'>) => Promise<Note>;
  updateNote: (id: number, updatedContent: Partial<Note>) => Promise<void>;
  updateNodePosition: (id: number, x: number, y: number) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  templates: [],
  isLoading: true,

  getUniqueTags: () => {
    const allTags = get().notes.flatMap(note => note.tags);
    return [...new Set(allTags)].sort();
  },

  fetchNotes: async () => {
    set({ isLoading: true });
    const notes = await db.notes.toArray();
    set({ notes, isLoading: false });
  },

  fetchTemplates: async () => {
    const templates = await db.templates.toArray();
    set({ templates });
  },

  addTemplate: async (templateData) => {
    const template: Template = { ...templateData, createdAt: new Date() };
    const id = await db.templates.add(template);
    set(state => ({ templates: [...state.templates, { ...template, id }] }));
  },

  updateTemplate: async (id, updatedContent) => {
    await db.templates.update(id, updatedContent);
    set(state => ({
      templates: state.templates.map(t => (t.id === id ? { ...t, ...updatedContent } : t))
    }));
  },

  deleteTemplate: async (id) => {
    await db.templates.delete(id);
    set(state => ({ templates: state.templates.filter(t => t.id !== id) }));
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
      iconType: IconType.Circle,
      iconColor: IconColor.Primary,
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

  updateNodePosition: async (id, x, y) => {
    await db.notes.update(id, { x, y, fx: x, fy: y });
    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? { ...note, x, y, fx: x, fy: y } : note)),
    }));
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
    searchService.remove(id, 'note');
  },
}));