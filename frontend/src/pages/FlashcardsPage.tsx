import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import FlashcardPlayer from '../components/flashcards/FlashcardPlayer';
import DeckView from '../components/flashcards/DeckView';
import DeckList from '../components/flashcards/DeckList';
import ConfirmationModal from '../components/ConfirmationModal';
import NewDeckModal from '../components/NewDeckModal';
import type { Flashcard } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, PlayCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

const FlashcardsPage: React.FC = () => {
  const { decks, allCards, fetchDecks, fetchAllCards, addDeck, deleteDeck, updateDeck } = useFlashcardStore();
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'review'>('list');
  const [reviewMode, setReviewMode] = useState<'due' | 'all'>('due');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
    fetchAllCards();
  }, [fetchDecks, fetchAllCards]);

  useEffect(() => {
    if (location.state?.selectedDeckId) {
        setSelectedDeckId(location.state.selectedDeckId);
        navigate(location.pathname, { replace: true });
    }
    else if (selectedDeckId && !decks.find(d => d.id === selectedDeckId)) {
      setSelectedDeckId(decks.length > 0 ? decks[0].id! : null);
    } else if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id!);
    }
  }, [decks, selectedDeckId, location.state, navigate]);

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

  const handleEditDeckName = () => {
    if (selectedDeck) {
      setIsEditingDeckName(true);
      setEditedDeckName(selectedDeck.name);
    }
  };

  const handleSaveDeckName = async () => {
    if (selectedDeckId && editedDeckName.trim()) {
      await updateDeck(selectedDeckId, editedDeckName.trim());
      setIsEditingDeckName(false);
    }
  };

  const handleCancelEditDeckName = () => {
    setIsEditingDeckName(false);
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
      <div className="w-1/4 border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Decks</h2>
            <button
                onClick={handleNewDeckClick}
                className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
                <PlusIcon className="h-4 w-4" />
                <span>New</span>
            </button>
        </div>
        <DeckList
          decks={decks}
          cardCounts={cardCounts}
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          onNewDeck={handleNewDeckClick}
        />
      </div>
      
      <div className="w-3/4 flex flex-col h-full overflow-y-auto">
        {selectedDeck ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              {/* Deck Name or Input Field */}
              <div className="flex items-center space-x-3 flex-grow pr-4">
                  {!isEditingDeckName ? (
                      <>
                          <h2 className="text-3xl text-gray-900 dark:text-white font-bold truncate">{selectedDeck.name}</h2>
                          <button onClick={handleEditDeckName} className="text-gray-500 hover:text-gray-700 dark:hover:text-white flex-shrink-0">
                              <PencilIcon className="h-5 w-5" />
                          </button>
                      </>
                  ) : (
                      <input 
                          type="text"
                          value={editedDeckName}
                          onChange={(e) => setEditedDeckName(e.target.value)}
                          className="text-3xl font-bold bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none border border-gray-300 dark:border-gray-600"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveDeckName()}
                          autoFocus
                      />
                  )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                  {isEditingDeckName ? (
                      <>
                          <button onClick={handleSaveDeckName} className="flex items-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
                              <CheckIcon className="h-5 w-5" />
                              <span>Save</span>
                          </button>
                           <button onClick={handleCancelEditDeckName} className="flex items-center space-x-2 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
                              <XMarkIcon className="h-5 w-5" />
                              <span>Cancel</span>
                          </button>
                      </>
                  ) : (
                      <>
                          <button 
                              onClick={() => { setReviewMode('all'); setView('review'); }} 
                              className="flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <PlayCircleIcon className="h-5 w-5" />
                              <span>Review All Cards</span>
                            </button>
                          <button 
                            onClick={() => { setReviewMode('due'); setView('review'); }} 
                            className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <PlayCircleIcon className="h-5 w-5" />
                            <span>Review Due</span>
                          </button>
                          <button 
                            onClick={handleDeleteDeck} 
                            className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span>Delete</span>
                          </button>
                      </>
                  )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">                
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