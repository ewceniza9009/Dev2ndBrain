import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Flashcard } from '../../types';

interface FlashcardPlayerProps {
  deckId: number;
  reviewMode: 'due' | 'all';
  onFinish: () => void;
}

const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ deckId, reviewMode, onFinish }) => {
  const { cards, fetchCardsByDeck, reviewCard } = useFlashcardStore();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchCardsByDeck(deckId);
  }, [deckId, fetchCardsByDeck]);

  const reviewQueue = useMemo(() => {
    if (reviewMode === 'all') {
      return cards;
    }
    return cards.filter(c => new Date(c.nextReview) <= new Date());
  }, [cards, reviewMode]);

  useEffect(() => {
    setQueue(reviewQueue);
    setCurrentCard(reviewQueue[0] || null);
    setIsFlipped(false);
  }, [reviewQueue]);

  const handleNextCard = (quality: number) => {
    if (!currentCard) return;
    reviewCard(currentCard.id!, quality);
    setIsFlipped(false);
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setCurrentCard(newQueue[0] || null);
  };
  
  if (queue.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl text-gray-900 dark:text-white">All done for now! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-400">You've completed this review session.</p>
        <button onClick={onFinish} className="mt-4 px-4 py-2 bg-teal-600 rounded text-white">Back to Decks</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center p-8 text-center text-gray-900 dark:text-white text-2xl mb-6">
        {currentCard && (isFlipped ? currentCard.answer : currentCard.question)}
      </div>

      {!isFlipped ? (
        <button onClick={() => setIsFlipped(true)} className="px-6 py-3 bg-blue-600 rounded-lg text-white text-lg">
          Show Answer
        </button>
      ) : (
        <div className="flex space-x-4">
          <button onClick={() => handleNextCard(1)} className="px-4 py-2 bg-red-600 rounded text-white">Again</button>
          <button onClick={() => handleNextCard(3)} className="px-4 py-2 bg-yellow-600 rounded text-white">Hard</button>
          <button onClick={() => handleNextCard(4)} className="px-4 py-2 bg-green-600 rounded text-white">Good</button>
          <button onClick={() => handleNextCard(5)} className="px-4 py-2 bg-teal-600 rounded text-white">Easy</button>
        </div>
      )}
    </div>
  );
};

export default FlashcardPlayer;