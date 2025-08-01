import React, { useEffect, useState, useRef } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Deck } from '../../types';

interface DeckViewProps {
  deck: Deck;
}

const DeckView: React.FC<DeckViewProps> = ({ deck }) => {
  const { cards, fetchCardsByDeck, addCard, deleteDeck } = useFlashcardStore();
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const questionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (deck.id) {
      fetchCardsByDeck(deck.id);
    }
  }, [deck.id, fetchCardsByDeck]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.question.trim() && newCard.answer.trim() && deck.id) {
      await addCard({ deckId: deck.id, question: newCard.question, answer: newCard.answer });
      setNewCard({ question: '', answer: '' });
      questionInputRef.current?.focus();
    }
  };

  const handleDeleteDeck = () => {
    if (deck.id) {
      deleteDeck(deck.id);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-gray-900 dark:text-white font-bold">{deck.name}</h2>
        <button onClick={handleDeleteDeck} className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white">
            Delete Deck
        </button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Card</h3>
        <form onSubmit={handleAddCard} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
            <textarea
              ref={questionInputRef}
              id="question"
              rows={2}
              value={newCard.question}
              onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
              className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label>
            <textarea
              id="answer"
              rows={3}
              value={newCard.answer}
              onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
              className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-teal-600 rounded-lg text-white font-semibold">Add Card</button>
        </form>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cards in this Deck</h3>
      <div className="space-y-2">
        {cards.length > 0 ? (
            cards.map(card => (
            <div key={card.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{card.question}</p>
                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                <p className="text-gray-600 dark:text-gray-300">{card.answer}</p>
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