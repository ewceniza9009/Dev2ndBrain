import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Flashcard } from '../../types';

interface FlashcardPlayerProps {
  deckId: number;
  reviewMode: 'due' | 'all';
  onFinish: () => void;
}

const SessionSummary: React.FC<{ stats: Record<string, number>, onFinish: () => void }> = ({ stats, onFinish }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Review Complete! 🎉</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">You've finished your review session. Here's how you did:</p>
      <ul className="list-none space-y-2 mb-6">
        {Object.entries(stats).map(([rating, count]) => (
          <li key={rating} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <span className="font-medium">{rating}</span>
            <span className="text-teal-500 font-bold">{count}</span>
          </li>
        ))}
      </ul>
      <button onClick={onFinish} className="mt-4 px-4 py-2 bg-teal-600 rounded text-white font-semibold">
        Back to Decks
      </button>
    </div>
  );
};

const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ deckId, reviewMode, onFinish }) => {
  const { cards, fetchCardsByDeck, reviewCard } = useFlashcardStore();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState<Record<string, number>>({});

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
    setSessionStats({}); // Reset stats for a new session
  }, [reviewQueue]);

  const handleNextCard = (quality: number, ratingLabel: string) => {
    if (!currentCard) return;
    reviewCard(currentCard.id!, quality);
    setIsFlipped(false);

    // Update session stats
    setSessionStats(prevStats => ({
      ...prevStats,
      [ratingLabel]: (prevStats[ratingLabel] || 0) + 1,
    }));

    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setCurrentCard(newQueue[0] || null);
  };
  
  if (queue.length === 0 && Object.keys(sessionStats).length > 0) {
    return <SessionSummary stats={sessionStats} onFinish={onFinish} />;
  }

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
      {/* The fix is to remove the centering classes and let the inner div scroll */}
      <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-900 dark:text-white text-2xl mb-6 transform transition-transform duration-500 hover:scale-102 h-[30rem]">
        <div className="h-full overflow-y-auto" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
          {currentCard && (isFlipped ? currentCard.answer : currentCard.question)}
        </div>
      </div>

      <div className="w-full max-w-2xl mt-4">
        <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
          <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${((reviewQueue.length - queue.length) / reviewQueue.length) * 100}%` }}></div>
        </div>
        <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
          {reviewQueue.length - queue.length} / {reviewQueue.length} cards reviewed
        </p>
      </div>

      <div className="mt-6">
        {!isFlipped ? (
          <button onClick={() => setIsFlipped(true)} className="px-6 py-3 bg-blue-600 rounded-lg text-white text-lg">
            Show Answer
          </button>
        ) : (
          <div className="flex space-x-4">
            <button onClick={() => handleNextCard(1, 'Again')} className="px-4 py-2 bg-red-600 rounded text-white">Again</button>
            <button onClick={() => handleNextCard(2, 'Typo')} className="px-4 py-2 bg-pink-600 rounded text-white">Typo</button>
            <button onClick={() => handleNextCard(3, 'Hard')} className="px-4 py-2 bg-yellow-600 rounded text-white">Hard</button>
            <button onClick={() => handleNextCard(4, 'Good')} className="px-4 py-2 bg-green-600 rounded text-white">Good</button>
            <button onClick={() => handleNextCard(5, 'Easy')} className="px-4 py-2 bg-teal-600 rounded text-white">Easy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardPlayer;