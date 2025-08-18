import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import { type Note, type Template, IconType, IconColor } from '../types';

interface NoteState {
  templates: Template[];
  getUniqueTags: () => Promise<string[]>;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: number, content: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  addNote: (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'uuid' | 'linkedNoteIds'>) => Promise<Note>;
  updateNote: (id: number, updatedContent: Partial<Note>) => Promise<void>;
  updateNodePosition: (id: number, x: number, y: number, isCollapsed?: boolean, fx?: number | null, fy?: number | null) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  templates: [],

  getUniqueTags: async () => {
    const notes = await db.notes.filter(note => !note.isDeleted).toArray();
    const allTags: string[] = [];
    notes.forEach(note => {
        if (note.tags) {
          allTags.push(...note.tags);
        }
    });
    return [...new Set(allTags)].sort();
  },

  fetchTemplates: async () => {
    const templates = await db.templates.filter(t => !t.isDeleted).toArray();
    set({ templates });
  },

  addTemplate: async (templateData) => {
    const now = new Date();
    const template: Template = { ...templateData, createdAt: now, updatedAt: now };
    await db.templates.add(template);
    get().fetchTemplates();
  },

  updateTemplate: async (id, updatedContent) => {
    const payload = { ...updatedContent, updatedAt: new Date() };
    await db.templates.update(id, payload);
    get().fetchTemplates();
  },

  deleteTemplate: async (id) => {
    await db.templates.update(id, { isDeleted: true, updatedAt: new Date() });
    get().fetchTemplates();
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
    searchService.add(createdNote, 'note');
    return createdNote;
  },

  updateNote: async (id, updatedContent) => {
    const now = new Date();
    await db.notes.update(id, { ...updatedContent, updatedAt: now });
    const updatedNote = await db.notes.get(id);

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
  },

  deleteNote: async (id) => {
    await db.notes.update(id, { isDeleted: true, updatedAt: new Date() });
    searchService.remove(id, 'note');
  },
}));