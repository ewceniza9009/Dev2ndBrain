import React, { useState, useRef } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Deck, Flashcard } from '../../types';
import { PlusIcon, CheckIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';

interface DeckViewProps {
  deck: Deck;
}

const DeckView: React.FC<DeckViewProps> = ({ deck }) => {
  const { addCard, updateCard } = useFlashcardStore();
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editedCard, setEditedCard] = useState<Partial<Flashcard> | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);

  const cards = useLiveQuery(
    () => db.flashcards.where({ deckId: deck.id! }).filter(c => !c.isDeleted).toArray(),
    [deck.id]
  ) || [];


  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.question.trim() && newCard.answer.trim() && deck.id) {
      await addCard({ deckId: deck.id, question: newCard.question, answer: newCard.answer });
      setNewCard({ question: '', answer: '' });
      questionInputRef.current?.focus();
    }
  };

  const handleEditClick = (card: Flashcard) => {
    setEditingCardId(card.id!);
    setEditedCard({ question: card.question, answer: card.answer });
  };

  const handleSaveEdit = async (cardId: number) => {
    if (editedCard?.question?.trim() && editedCard?.answer?.trim()) {
      await updateCard(cardId, editedCard);
      setEditingCardId(null);
      setEditedCard(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditedCard(null);
  };

  return (
    <div className="p-2">
      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-8 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Add New Card</h3>
        <form onSubmit={handleAddCard} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
            <textarea
              ref={questionInputRef}
              id="question"
              rows={2}
              value={newCard.question}
              onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
              className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label>
            <textarea
              id="answer"
              rows={3}
              value={newCard.answer}
              onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
              className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button type="submit" className="flex items-center space-x-2 px-5 py-2 bg-teal-600 rounded-lg text-white text-md hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200">
            <PlusIcon className="h-5 w-5" />
            <span>Add Card</span>
          </button>
        </form>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cards in this Deck</h3>
      <div className="space-y-4">
        {cards.length > 0 ? (
          cards.map(card => (
            <div key={card.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
              {editingCardId === card.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editedCard?.question}
                    onChange={(e) => setEditedCard(prev => ({...prev, question: e.target.value}))}
                    className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={editedCard?.answer}
                    onChange={(e) => setEditedCard(prev => ({...prev, answer: e.target.value}))}
                    className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <div className="flex space-x-2 justify-end">
                    <button onClick={() => handleSaveEdit(card.id!)} className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
                        <CheckIcon className="h-5 w-5" />
                        <span>Save</span>
                    </button>
                    <button onClick={handleCancelEdit} className="flex items-center space-x-1 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
                        <XMarkIcon className="h-5 w-5" />
                        <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{card.question}</p>
                    <hr className="my-2 border-gray-300 dark:border-gray-600" />
                    <p className="text-gray-600 dark:text-gray-300">{card.answer}</p>
                  </div>
                  <button onClick={() => handleEditClick(card)} className="flex items-center space-x-1 px-4 py-2 text-md bg-gray-600 rounded-lg text-white hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200">
                    <PencilSquareIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">This deck is empty. Add your first card above!</p>
        )}
      </div>
    </div>
  );
};

export default DeckView;