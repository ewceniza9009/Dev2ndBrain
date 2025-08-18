import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import FlashcardPlayer from '../components/flashcards/FlashcardPlayer';
import DeckView from '../components/flashcards/DeckView';
import DeckList from '../components/flashcards/DeckList';
import ConfirmationModal from '../components/ConfirmationModal';
import NewDeckModal from '../components/NewDeckModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, PlayCircleIcon, PencilIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { debounce } from 'lodash-es';

const FlashcardsPage: React.FC = () => {
  const { addDeck, deleteDeck, updateDeck } = useFlashcardStore();
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'review'>('list');
  const [reviewMode, setReviewMode] = useState<'due' | 'all'>('due');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [filterTerm, setFilterTerm] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');

  const debouncedSetFilter = useMemo(() => debounce(setDebouncedFilter, 300), []);

  useEffect(() => {
    debouncedSetFilter(filterTerm);
  }, [filterTerm, debouncedSetFilter]);

  const decks = useLiveQuery(
    () => {
      const lowerFilter = debouncedFilter.toLowerCase();
      return db.decks.filter(deck => {
        if (deck.isDeleted) return false;
        if (!lowerFilter) return true;
        return deck.name.toLowerCase().includes(lowerFilter);
      }).toArray();
    },
    [debouncedFilter]
  ) || [];
  
  const cardCounts = useLiveQuery(async () => {
    const counts: { [key: number]: number } = {};
    if (!decks || decks.length === 0) return {};

    await Promise.all(decks.map(async (deck) => {
      if (deck.id) {
        const count = await db.flashcards.where({ deckId: deck.id }).filter(c => !c.isDeleted).count();
        counts[deck.id] = count;
      }
    }));
    return counts;
  }, [decks]) || {};

  useEffect(() => {
    if (location.state?.selectedDeckId) {
      setSelectedDeckId(location.state.selectedDeckId);
      navigate(location.pathname, { replace: true });
    } else if (selectedDeckId === null && decks.length > 0) {
      setSelectedDeckId(decks[0].id!);
    } else if (selectedDeckId && !decks.find(d => d.id === selectedDeckId)) {
      setSelectedDeckId(decks.length > 0 ? decks[0].id! : null);
    }
  }, [decks, selectedDeckId, location.state, navigate]);

  const handleNewDeckClick = () => setIsNewDeckModalOpen(true);
  
  const handleAddDeck = async (name: string) => {
    if (name?.trim()) {
      const newDeck = await addDeck(name.trim());
      if (newDeck?.id) setSelectedDeckId(newDeck.id);
    }
    setIsNewDeckModalOpen(false);
  };

  const handleDeleteDeck = () => setIsConfirmModalOpen(true);

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

  const selectedDeck = useLiveQuery(
    () => selectedDeckId ? db.decks.get(selectedDeckId) : undefined,
    [selectedDeckId]
  ) ?? null;

  if (view === 'review' && selectedDeck) {
    return (
      <div className="p-6">
        <FlashcardPlayer deckId={selectedDeck.id!} reviewMode={reviewMode} onFinish={() => setView('list')} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Decks</h2>
            <button onClick={handleNewDeckClick} className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md">
              <PlusIcon className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
          <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" placeholder="Filter decks..." value={filterTerm} onChange={e => setFilterTerm(e.target.value)} className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <DeckList decks={decks} cardCounts={cardCounts} selectedDeckId={selectedDeckId} onSelectDeck={setSelectedDeckId} />
      </div>
      
      <div className="w-3/4 flex flex-col h-full overflow-y-auto">
        {selectedDeck ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3 flex-grow pr-4">
                  {!isEditingDeckName ? (
                      <>
                          <h2 className="text-3xl text-gray-900 dark:text-white font-bold truncate">{selectedDeck.name}</h2>
                          <button onClick={handleEditDeckName} className="text-gray-500 hover:text-gray-700 dark:hover:text-white flex-shrink-0"><PencilIcon className="h-5 w-5" /></button>
                      </>
                  ) : (
                      <input type="text" value={editedDeckName} onChange={(e) => setEditedDeckName(e.target.value)} className="text-3xl font-bold bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none border border-gray-300 dark:border-gray-600" onKeyDown={(e) => e.key === 'Enter' && handleSaveDeckName()} autoFocus />
                  )}
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                  {isEditingDeckName ? (
                    <>
                      <button onClick={handleSaveDeckName} className="flex items-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 shadow-md"><CheckIcon className="h-5 w-5" /><span>Save</span></button>
                      <button onClick={() => setIsEditingDeckName(false)} className="flex items-center space-x-2 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-600 shadow-md"><XMarkIcon className="h-5 w-5" /><span>Cancel</span></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setReviewMode('all'); setView('review'); }} className="flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 shadow-md"><PlayCircleIcon className="h-5 w-5" /><span>Review All Cards</span></button>
                      <button onClick={() => { setReviewMode('due'); setView('review'); }} className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-purple-700 shadow-md"><PlayCircleIcon className="h-5 w-5" /><span>Review Due</span></button>
                      <button onClick={handleDeleteDeck} className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md"><TrashIcon className="h-5 w-5" /><span>Delete</span></button>
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

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDeleteDeck} title="Confirm Deck Deletion" message={`Are you sure you want to delete the deck "${selectedDeck?.name}"? This action cannot be undone.`} />
      <NewDeckModal isOpen={isNewDeckModalOpen} onClose={() => setIsNewDeckModalOpen(false)} onConfirm={handleAddDeck} />
    </div>
  );
};

export default FlashcardsPage;