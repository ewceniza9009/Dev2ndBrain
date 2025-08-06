import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayIcon } from '@heroicons/react/20/solid';

interface FlashcardSummaryProps {
  dueCount: number;
}

const FlashcardSummary: React.FC<FlashcardSummaryProps> = ({ dueCount }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-teal-600 dark:text-teal-400">{dueCount}</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">cards due for review</p>
      </div>
      <button
        onClick={() => navigate('/flashcards')}
        className="flex items-center space-x-2 px-6 py-3 font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 disabled:bg-gray-500 shadow-lg transition-all duration-300 transform hover:scale-105"
        disabled={dueCount === 0}
      >
        <PlayIcon className="h-5 w-5" />
        <span>Start Review</span>
      </button>
    </div>
  );
};

export default FlashcardSummary;