import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/db';
import { SparklesIcon, PlayIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import type { Flashcard } from '../../types';
import { useNavigate } from 'react-router-dom';

const ImpromptuCard: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [cardCount, setCardCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const loadRandomCard = useCallback(async () => {
    // VITAL FIX: Use .filter() to correctly count all non-deleted cards.
    const count = await db.flashcards.filter(c => !c.isDeleted).count();
    setCardCount(count);

    if (count > 0) {
      const randomIndex = Math.floor(Math.random() * count);
      const randomCards = await db.flashcards.filter(c => !c.isDeleted).offset(randomIndex).limit(1).toArray();
      if (randomCards.length > 0) {
        setCurrentCard(randomCards[0]);
        setIsFlipped(false);
      }
    } else {
      setCurrentCard(null);
    }
  }, []);

  useEffect(() => {
    loadRandomCard();
  }, [loadRandomCard]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleNavigateToDecks = () => {
    navigate('/flashcards');
  };

  if (cardCount === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center space-y-4 h-full min-h-[250px] transition-all duration-300">
        <SparklesIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="text-gray-500 dark:text-gray-400 text-center">Add some flashcards to get impromptu questions!</p>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col justify-between transition-all duration-300">
      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Daily Brain Teaser 🤔</h2>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md min-h-[100px] flex flex-col items-center justify-center text-center transition-all duration-300">
          {!isFlipped ? (
            <p className="text-lg font-medium text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: currentCard.question }} />
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Answer:</p>
              <p className="text-sm font-bold text-yellow-600 dark:text-blue-400" dangerouslySetInnerHTML={{ __html: currentCard.answer }} />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 disabled:bg-gray-500 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Show Answer</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={loadRandomCard}
              className="flex-grow flex items-center justify-center space-x-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <span>Next Card</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNavigateToDecks}
              className="flex items-center justify-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md transition-all duration-300"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpromptuCard;