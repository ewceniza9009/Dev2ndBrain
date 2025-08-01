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
    <div className="flex flex-col h-full w-full justify-center items-center py-6">
      {/* The main flashcard container */}
      <div className="relative w-full max-w-4xl min-h-[30rem] bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-gray-900 dark:text-white flex flex-col justify-between">
        
        {/* Buttons container at the top right */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          {!isFlipped ? (
            <button onClick={() => setIsFlipped(true)} className="px-6 py-3 bg-blue-600 rounded-lg text-white text-lg">
              Show Answer
            </button>
          ) : (
            <>
              <button onClick={() => handleNextCard(1, 'Again')} className="px-4 py-2 bg-red-600 rounded text-white text-sm">Again</button>
              <button onClick={() => handleNextCard(3, 'Hard')} className="px-4 py-2 bg-yellow-600 rounded text-white text-sm">Hard</button>
              <button onClick={() => handleNextCard(4, 'Good')} className="px-4 py-2 bg-green-600 rounded text-white text-sm">Good</button>
              <button onClick={() => handleNextCard(5, 'Easy')} className="px-4 py-2 bg-teal-600 rounded text-white text-sm">Easy</button>
            </>
          )}
        </div>

        {/* Text content area that fills the remaining space */}
        <div className="prose dark:prose-invert mt-12 overflow-y-auto w-full h-full" style={{ whiteSpace: 'pre-wrap' }}>
          {currentCard && (isFlipped ? currentCard.answer : currentCard.question)}
        </div>
      </div>
    </div>
  );
};

export default FlashcardPlayer;