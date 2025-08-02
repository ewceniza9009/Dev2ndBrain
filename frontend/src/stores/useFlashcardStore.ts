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
    allCards: Flashcard[];
    fetchDecks: () => Promise<void>;
    fetchAllCards: () => Promise<void>;
    addDeck: (name: string) => Promise<Deck | undefined>;
    deleteDeck: (deckId: number) => Promise<void>;
    getDeckById: (id: number) => Deck | undefined;
    fetchCardsByDeck: (deckId: number) => Promise<void>;
    addCard: (cardData: Omit<Flashcard, 'id' | 'nextReview' | 'easeFactor' | 'repetitions' | 'interval'>) => Promise<void>;
    updateCard: (cardId: number, updatedContent: Partial<Flashcard>) => Promise<void>;
    reviewCard: (cardId: number, quality: number) => Promise<void>;
    createCardsFromContent: (content: string, deckId: number) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
    decks: [],
    cards: [],
    allCards: [],
    
    fetchDecks: async () => {
        const decks = await db.decks.toArray();
        set({ decks });
    },

    fetchAllCards: async () => {
        const allCards = await db.flashcards.toArray();
        set({ allCards });
    },

    addDeck: async (name) => {
        const newDeck: Deck = { name, createdAt: new Date() };
        const id = await db.decks.add(newDeck);
        const createdDeck = { ...newDeck, id };
        set(state => ({ decks: [...state.decks, createdDeck] }));
        return createdDeck;
    },

    deleteDeck: async (deckId: number) => {
        if (!window.confirm("Are you sure you want to delete this deck and all its cards? This action cannot be undone.")) {
            return;
        }
        await db.transaction('rw', db.decks, db.flashcards, async () => {
            await db.flashcards.where('deckId').equals(deckId).delete();
            await db.decks.delete(deckId);
        });

        set((state) => ({
            decks: state.decks.filter((d) => d.id !== deckId),
            allCards: state.allCards.filter((c) => c.deckId !== deckId),
        }));
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
        get().fetchCardsByDeck(cardData.deckId);
        get().fetchAllCards();
    },

    updateCard: async (cardId, updatedContent) => {
        await db.flashcards.update(cardId, updatedContent);
        set((state) => ({
            cards: state.cards.map((c) => (c.id === cardId ? { ...c, ...updatedContent } : c)),
            allCards: state.allCards.map((c) => (c.id === cardId ? { ...c, ...updatedContent } : c)),
        }));
    },

    reviewCard: async (cardId, quality) => {
        const card = await db.flashcards.get(cardId);
        if (!card) return;

        const updates = sm2(card, quality);
        await db.flashcards.update(cardId, updates);
    },

    createCardsFromContent: async (content: string, deckId: number) => {
        const regex = /Q:(.*?)\nA:(.*?)(?=\n--|\nQ:|$)/gs;
        let matches;
        const newCards: Omit<Flashcard, 'id'>[] = [];

        while ((matches = regex.exec(content)) !== null) {
            const question = matches[1].trim();
            const answer = matches[2].trim();

            if (question && answer) {
                newCards.push({
                    deckId,
                    question,
                    answer,
                    nextReview: new Date(),
                    easeFactor: 2.5,
                    repetitions: 0,
                    interval: 0,
                });
            }
        }

        if (newCards.length > 0) {
            await db.flashcards.bulkAdd(newCards as Flashcard[]);
            get().fetchAllCards();
            get().fetchCardsByDeck(deckId);
        }
    },
}));