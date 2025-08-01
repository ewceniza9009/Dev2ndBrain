import React from 'react';

const FlashcardsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Flashcard Decks</h1>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <p>The component for managing flashcard decks and starting review sessions will be rendered here.</p>
      </div>
    </div>
  );
};

export default FlashcardsPage;