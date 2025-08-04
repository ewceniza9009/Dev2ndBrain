import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import FlashcardPlayer from '../components/flashcards/FlashcardPlayer';
import DeckView from '../components/flashcards/DeckView';
import DeckList from '../components/flashcards/DeckList';
import ConfirmationModal from '../components/ConfirmationModal';
import NewDeckModal from '../components/NewDeckModal';
import type { Flashcard } from '../types';
import { useLocation, useNavigate } from 'react-router-dom'; // NEW: Import hooks

const FlashcardsPage: React.FC = () => {
  const { decks, allCards, fetchDecks, fetchAllCards, addDeck, deleteDeck } = useFlashcardStore();
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'review'>('list');
  const [reviewMode, setReviewMode] = useState<'due' | 'all'>('due');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const location = useLocation(); // NEW
  const navigate = useNavigate(); // NEW

  useEffect(() => {
    fetchDecks();
    fetchAllCards();
  }, [fetchDecks, fetchAllCards]);

  useEffect(() => {
    // NEW: Check for a selected deck ID from navigation state
    if (location.state?.selectedDeckId) {
        setSelectedDeckId(location.state.selectedDeckId);
        navigate(location.pathname, { replace: true }); // Clear state
    }
    // Existing logic for selecting a deck
    else if (selectedDeckId && !decks.find(d => d.id === selectedDeckId)) {
      setSelectedDeckId(decks.length > 0 ? decks[0].id! : null);
    } else if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id!);
    }
  }, [decks, selectedDeckId, location.state]);

  const cardCounts = useMemo(() => {
    return allCards.reduce((acc: { [key: number]: number }, card: Flashcard) => {
      acc[card.deckId] = (acc[card.deckId] || 0) + 1;
      return acc;
    }, {});
  }, [allCards]);
  
  const handleNewDeckClick = () => {
    setIsNewDeckModalOpen(true);
  };
  
  const handleAddDeck = async (name: string) => {
    if (name && name.trim()) {
      await addDeck(name.trim());
      const newDecks = useFlashcardStore.getState().decks;
      setSelectedDeckId(newDecks[newDecks.length - 1].id!);
    }
    setIsNewDeckModalOpen(false);
  };

  const handleDeleteDeck = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDeleteDeck = () => {
    if (selectedDeckId) {
      deleteDeck(selectedDeckId);
      setIsConfirmModalOpen(false);
    }
  };

  const selectedDeck = decks.find(d => d.id === selectedDeckId) || null;

  if (view === 'review' && selectedDeck) {
    return (
      <div className="p-6 h-full flex-grow">
        <FlashcardPlayer
          deckId={selectedDeck.id!}
          reviewMode={reviewMode}
          onFinish={() => setView('list')}
        />
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
          onNewDeck={handleNewDeckClick}
        />
      </div>
      
      <div className="w-2/3 flex flex-col h-full overflow-y-auto">
        {selectedDeck ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl text-gray-900 dark:text-white font-bold">{selectedDeck.name}</h2>
                <button onClick={() => { setReviewMode('all'); setView('review'); }} className="px-4 py-2 text-sm bg-blue-600 rounded-lg text-white">
                  Review All
                </button>
                <button onClick={() => { setReviewMode('due'); setView('review'); }} className="px-4 py-2 text-sm bg-purple-600 rounded-lg text-white">
                  Review Due
                </button>
              </div>
              <button onClick={handleDeleteDeck} className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white">
                Delete Deck
              </button>
            </div>
            
            <div>
              <DeckView deck={selectedDeck} />
            </div>
          </div>
        ) : (
          <div className="p-8 text-gray-500 dark:text-gray-400">Select a deck or create a new one.</div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDeleteDeck}
        title="Confirm Deck Deletion"
        message={`Are you sure you want to delete the deck "${selectedDeck?.name}"? This action cannot be undone.`}
      />

      <NewDeckModal
        isOpen={isNewDeckModalOpen}
        onClose={() => setIsNewDeckModalOpen(false)}
        onConfirm={handleAddDeck}
      />
    </div>
  );
};

export default FlashcardsPage;