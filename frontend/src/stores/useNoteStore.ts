import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { type Note, type Template, IconType, IconColor } from '../types';

interface NoteState {
  notes: Note[];
  templates: Template[];
  isLoading: boolean;
  getUniqueTags: () => string[];
  fetchNotes: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: number, content: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  getNoteById: (id: number) => Note | undefined;
  addNote: (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'uuid' | 'linkedNoteIds'>) => Promise<Note>;
  updateNote: (id: number, updatedContent: Partial<Note>) => Promise<void>;
  updateNodePosition: (id: number, x: number, y: number, isCollapsed?: boolean, fx?: number | null, fy?: number | null) => Promise<void>;
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
    const notes = await db.notes.filter(note => !note.isDeleted).toArray();
    set({ notes, isLoading: false });
  },

  fetchTemplates: async () => {
    const templates = await db.templates.filter(t => !t.isDeleted).toArray();
    set({ templates });
  },

  addTemplate: async (templateData) => {
    const now = new Date();
    const template: Template = { ...templateData, createdAt: now, updatedAt: now };
    const id = await db.templates.add(template);
    set(state => ({ templates: [...state.templates, { ...template, id }] }));
  },

  updateTemplate: async (id, updatedContent) => {
    const payload = { ...updatedContent, updatedAt: new Date() };
    await db.templates.update(id, payload);
    set(state => ({
      templates: state.templates.map(t => (t.id === id ? { ...t, ...payload } : t))
    }));
  },

  deleteTemplate: async (id) => {
    await db.templates.update(id, { isDeleted: true, updatedAt: new Date() });
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

  updateNodePosition: async (id, x, y, isCollapsed, fx, fy) => {
    const updateData: Partial<Note> = { x, y, updatedAt: new Date() };
    if (isCollapsed !== undefined) {
      updateData.isCollapsed = isCollapsed;
    }
    if (fx !== undefined) {
      updateData.fx = fx;
    }
    if (fy !== undefined) {
      updateData.fy = fy;
    }

    await db.notes.update(id, updateData);
    
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updateData }
          : note
      ),
    }));
  },

  deleteNote: async (id) => {
    await db.notes.update(id, { isDeleted: true, updatedAt: new Date() });
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
    searchService.remove(id, 'note');
  },
}));