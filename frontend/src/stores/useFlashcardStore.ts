import { create } from 'zustand';
import { db } from '../services/db';
import type { Deck, Flashcard } from '../types';

// SM-2 Spaced Repetition Algorithm Logic
const sm2 = (card: Flashcard, quality: number): Partial<Flashcard> => {
  if (quality < 3) {
    return { repetitions: 0, interval: 1, nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }
  let newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  let newInterval = card.repetitions === 0 ? 1 : card.repetitions === 1 ? 6 : Math.round(card.interval * newEaseFactor);
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: card.repetitions + 1,
    nextReview: nextReviewDate,
  };
};

interface FlashcardState {
  decks: Deck[];
  cards: Flashcard[];
  allCards: Flashcard[]; // <-- Add this property
  fetchDecks: () => Promise<void>;
  fetchAllCards: () => Promise<void>;
  addDeck: (name: string) => Promise<void>;
  getDeckById: (id: number) => Deck | undefined;
  fetchCardsByDeck: (deckId: number) => Promise<void>;
  addCard: (cardData: Omit<Flashcard, 'id' | 'nextReview' | 'easeFactor' | 'repetitions' | 'interval'>) => Promise<void>;
  reviewCard: (cardId: number, quality: number) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  decks: [],
  cards: [],
  allCards: [], // <-- Initialize the state here
  
  fetchAllCards: async () => {
    const allCards = await db.flashcards.toArray();
    set({ allCards });
  },

  fetchDecks: async () => {
    const decks = await db.decks.toArray();
    set({ decks });
  },

  addDeck: async (name) => {
    const newDeck: Deck = { name, createdAt: new Date() };
    const id = await db.decks.add(newDeck);
    set(state => ({ decks: [...state.decks, { ...newDeck, id }] }));
    get().fetchAllCards(); // Refresh counts when a deck is added
  },
  
  getDeckById: (id) => {
    return get().decks.find(deck => deck.id === id);
  },

  fetchCardsByDeck: async (deckId) => {
    const cards = await db.flashcards.where('deckId').equals(deckId).toArray();
    set({ cards });
  },

  addCard: async (cardData) => {
    const newCard: Flashcard = {
      ...cardData,
      nextReview: new Date(),
      easeFactor: 2.5,
      repetitions: 0,
      interval: 0,
    };
    await db.flashcards.add(newCard);
    get().fetchCardsByDeck(cardData.deckId); // Refresh the view for the current deck
    get().fetchAllCards(); // Refresh the counts
  },

  reviewCard: async (cardId, quality) => {
    const card = await db.flashcards.get(cardId);
    if (!card) return;

    const updates = sm2(card, quality);
    await db.flashcards.update(cardId, updates);
  },
}));