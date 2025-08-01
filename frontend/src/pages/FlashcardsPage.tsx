import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import FlashcardPlayer from '../components/flashcards/FlashcardPlayer';
import DeckView from '../components/flashcards/DeckView';
import DeckList from '../components/flashcards/DeckList';
import type { Flashcard } from '../types';

const FlashcardsPage: React.FC = () => {
  const { decks, allCards, fetchDecks, fetchAllCards, addDeck } = useFlashcardStore();
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchDecks();
    fetchAllCards();
  }, [fetchDecks, fetchAllCards]);

  useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id!);
    }
  }, [decks, selectedDeckId]);

  const cardCounts = useMemo(() => {
    return allCards.reduce((acc: { [key: number]: number }, card: Flashcard) => {
      acc[card.deckId] = (acc[card.deckId] || 0) + 1;
      return acc;
    }, {});
  }, [allCards]);

  const handleNewDeck = async () => {
    const name = prompt("Enter new deck name:");
    if (name && name.trim()) {
      await addDeck(name.trim());
      const newDecks = useFlashcardStore.getState().decks;
      setSelectedDeckId(newDecks[newDecks.length - 1].id!);
    }
  };

  const selectedDeck = decks.find(d => d.id === selectedDeckId) || null;

  if (isReviewing && selectedDeck) {
    return (
        <div className="p-6">
             <FlashcardPlayer deckId={selectedDeck.id!} onFinish={() => setIsReviewing(false)} />
        </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
        <DeckList
          decks={decks}
          cardCounts={cardCounts}
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          onNewDeck={handleNewDeck}
        />
      </div>

      <div className="w-2/3">
        {selectedDeck ? (
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    {/* The Deck Name is now rendered inside DeckView */}
                    <span></span> 
                    <button onClick={() => setIsReviewing(true)} className="px-4 py-2 bg-blue-600 rounded text-white">
                        Review This Deck
                    </button>
                </div>
                <DeckView deck={selectedDeck} />
            </div>
        ) : (
            <div className="p-8 text-gray-500 dark:text-gray-400">Select a deck or create a new one.</div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;