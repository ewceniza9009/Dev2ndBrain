import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { SparklesIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { AiReview } from '../../types';
import ReactMarkdown from 'react-markdown'; // Import the library

const AiReviewsSummary: React.FC = () => {
  const reviews = useLiveQuery(() => db.aiReviews.orderBy('timestamp').reverse().limit(3).toArray(), []) || [];

  const handleViewAll = () => {
    // This could be replaced with a modal or dedicated page
    alert("Feature to view all reviews is not implemented yet. You would see a list of all past AI reviews here.");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          <SparklesIcon className="h-7 w-7 text-indigo-600" />
          <span>Recent AI Reviews</span>
        </h2>
        {reviews.length > 0 && (
          <button onClick={handleViewAll} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center">
            View All <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>

      {reviews.length > 0 ? (
        <ul className="space-y-6">
          {reviews.map((review: AiReview, index: number) => (
            <li key={index} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <p className="text-base font-semibold text-gray-900 dark:text-white">{review.deckName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 sm:mt-0">Reviewed on {new Date(review.timestamp).toLocaleDateString()}</p>
              </div>
              <article className="prose dark:prose-invert prose-sm max-w-none text-sm text-gray-700 dark:text-gray-300">
                <ReactMarkdown>{review.feedback}</ReactMarkdown>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-gray-500 dark:text-gray-400">No AI reviews yet. Complete a flashcard session to get started!</p>
        </div>
      )}
    </div>
  );
};

export default AiReviewsSummary;