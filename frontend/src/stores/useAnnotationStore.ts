import { create } from 'zustand';
import { db } from '../services/db';
import type { AnnotationState, CanvasItem, Edge } from '../types';

interface AnnotationStoreState {
  currentAnnotationState: AnnotationState;
  filterCriteria: string | null;
  updateAnnotationState: (filterCriteria: string) => Promise<void>;
  addItem: (filterCriteria: string, item: Omit<CanvasItem, 'tag'>) => Promise<void>;
  updateItem: (filterCriteria: string, itemId: string, updatedProps: Partial<CanvasItem>) => Promise<void>;
  removeItem: (filterCriteria: string, itemId: string) => Promise<void>;
  addEdge: (filterCriteria: string, edge: Edge) => Promise<void>;
  removeEdge: (filterCriteria: string, startId: string, endId: string) => Promise<void>;
  bringToFront: (filterCriteria: string, itemId: string) => Promise<void>;
  bringToBack: (filterCriteria: string, itemId: string) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationStoreState>((set, get) => ({
  currentAnnotationState: { items: [], edges: [] },
  filterCriteria: null,

  updateAnnotationState: async (filterCriteria: string) => {
    if (get().filterCriteria === filterCriteria) {
      return;
    }

    const savedState = await db.annotations.get({ filterCriteria });
    set({
      currentAnnotationState: savedState?.state || { items: [], edges: [] },
      filterCriteria,
    });
  },

  addItem: async (filterCriteria: string, item: Omit<CanvasItem, 'tag'>) => {
    const state = get().currentAnnotationState;
    const newItemWithTag = { ...item, tag: filterCriteria };
    const newState = { ...state, items: [...state.items, newItemWithTag] };
    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },

  updateItem: async (filterCriteria: string, itemId: string, updatedProps: Partial<CanvasItem>) => {
    const state = get().currentAnnotationState;
    const newItems = state.items.map((i) => (i.id === itemId ? { ...i, ...updatedProps } : i));
    const newState = { ...state, items: newItems };
    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },

  removeItem: async (filterCriteria: string, itemId: string) => {
    const state = get().currentAnnotationState;
    const newItems = state.items.filter((i) => i.id !== itemId);
    const newEdges = state.edges.filter((e) => e.start !== itemId && e.end !== itemId);
    const newState = { items: newItems, edges: newEdges };
    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },

  addEdge: async (filterCriteria: string, edge: Edge) => {
    const state = get().currentAnnotationState;
    const newState = { ...state, edges: [...state.edges, edge] };
    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },

  removeEdge: async (filterCriteria: string, startId: string, endId: string) => {
    const state = get().currentAnnotationState;
    const newEdges = state.edges.filter((e) => !(e.start === startId && e.end === endId));
    const newState = { ...state, edges: newEdges };
    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },
  
  // VITAL CHANGE: Added bringToFront method
  bringToFront: async (filterCriteria: string, itemId: string) => {
    const state = get().currentAnnotationState;
    const itemToMove = state.items.find(i => i.id === itemId);
    if (!itemToMove) return;

    const newItems = state.items.filter(i => i.id !== itemId);
    const newState = { ...state, items: [...newItems, itemToMove] };

    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },

  // VITAL CHANGE: Added bringToBack method
  bringToBack: async (filterCriteria: string, itemId: string) => {
    const state = get().currentAnnotationState;
    const itemToMove = state.items.find(i => i.id === itemId);
    if (!itemToMove) return;

    const newItems = state.items.filter(i => i.id !== itemId);
    const newState = { ...state, items: [itemToMove, ...newItems] };

    set({ currentAnnotationState: newState });
    await db.annotations.put({ filterCriteria, state: newState });
  },
}));