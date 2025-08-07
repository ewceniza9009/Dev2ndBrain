import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import type { Deck, Flashcard } from '../types';

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
    updateDeck: (deckId: number, name: string) => Promise<void>;
    getDeckById: (id: number) => Deck | undefined;
    fetchCardsByDeck: (deckId: number) => Promise<void>;
    addCard: (cardData: Omit<Flashcard, 'id' | 'nextReview' | 'easeFactor' | 'repetitions' | 'interval' | 'updatedAt' | 'isDeleted'>) => Promise<void>;
    updateCard: (cardId: number, updatedContent: Partial<Flashcard>) => Promise<void>;
    reviewCard: (cardId: number, quality: number) => Promise<void>;
    createCardsFromContent: (content: string, deckId: number) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
    decks: [],
    cards: [],
    allCards: [],
    
    fetchDecks: async () => {
        const decks = await db.decks.filter(d => !d.isDeleted).toArray();
        set({ decks });
    },

    fetchAllCards: async () => {
        const allCards = await db.flashcards.filter(c => !c.isDeleted).toArray();
        set({ allCards });
    },

    addDeck: async (name: string) => {
        const now = new Date();
        const newDeck: Deck = { name, createdAt: now, updatedAt: now };
        const id = await db.decks.add(newDeck);
        const createdDeck = { ...newDeck, id };
        set(state => ({ decks: [...state.decks, createdDeck] }));
        searchService.add(createdDeck, 'flashcard');
        return createdDeck;
    },

    deleteDeck: async (deckId: number) => {
        const now = new Date();
        // Soft delete the deck and all its cards
        await db.transaction('rw', db.decks, db.flashcards, async () => {
            await db.decks.update(deckId, { isDeleted: true, updatedAt: now });
            const cardIdsToUpdate = await db.flashcards.where('deckId').equals(deckId).primaryKeys();
            await db.flashcards.bulkUpdate(cardIdsToUpdate.map(id => ({ key: id, changes: { isDeleted: true, updatedAt: now }})));
        });

        // Update the UI state
        set((state) => ({
            decks: state.decks.filter((d) => d.id !== deckId),
            allCards: state.allCards.filter((c) => c.deckId !== deckId),
        }));
        // Remove from search index
        searchService.remove(deckId, 'flashcard');
    },
    
    getDeckById: (id: number) => {
        return get().decks.find(deck => deck.id === id);
    },

    fetchCardsByDeck: async (deckId: number) => {
        const cards = await db.flashcards.where({ deckId }).filter(c => !c.isDeleted).toArray();
        set({ cards });
    },

    addCard: async (cardData) => {
        const now = new Date();
        const newCard: Flashcard = {
            ...cardData,
            nextReview: now,
            easeFactor: 2.5,
            repetitions: 0,
            interval: 0,
            updatedAt: now,
        };
        await db.flashcards.add(newCard);
        get().fetchCardsByDeck(cardData.deckId);
        get().fetchAllCards();
    },

    updateCard: async (cardId: number, updatedContent: Partial<Flashcard>) => {
        const payload = { ...updatedContent, updatedAt: new Date() };
        await db.flashcards.update(cardId, payload);
        set((state) => ({
            cards: state.cards.map((c) => (c.id === cardId ? { ...c, ...payload } : c)),
            allCards: state.allCards.map((c) => (c.id === cardId ? { ...c, ...payload } : c)),
        }));
    },

    reviewCard: async (cardId: number, quality: number) => {
        const card = await db.flashcards.get(cardId);
        if (!card) return;

        const updates = sm2(card, quality);
        await db.flashcards.update(cardId, { ...updates, updatedAt: new Date() });
    },

    createCardsFromContent: async (content: string, deckId: number) => {
        const regex = /Q:(.*?)\nA:(.*?)(?=\n--|\nQ:|$)/gs;
        let matches;
        const newCards: Omit<Flashcard, 'id'>[] = [];
        const now = new Date();

        while ((matches = regex.exec(content)) !== null) {
            const question = matches[1].trim();
            const answer = matches[2].trim();

            if (question && answer) {
                newCards.push({
                    deckId,
                    question,
                    answer,
                    nextReview: now,
                    easeFactor: 2.5,
                    repetitions: 0,
                    interval: 0,
                    updatedAt: now,
                });
            }
        }

        if (newCards.length > 0) {
            await db.flashcards.bulkAdd(newCards as Flashcard[]);
            get().fetchAllCards();
            get().fetchCardsByDeck(deckId);
        }
    },

    updateDeck: async (deckId: number, name: string) => {
        const payload = { name, updatedAt: new Date() };
        await db.decks.update(deckId, payload);

        const updatedDeck = await db.decks.get(deckId);

        if (updatedDeck) {
            searchService.add(updatedDeck, 'flashcard');
        }

        set(state => ({
            decks: state.decks.map(deck =>
                deck.id === deckId ? { ...deck, ...payload } : deck
            ),
        }));
    },
}));