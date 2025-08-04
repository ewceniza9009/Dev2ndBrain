import React from 'react';
import type { Deck } from '../../types';

interface DeckListProps {
  decks: Deck[];
  cardCounts: { [key: number]: number };
  selectedDeckId: number | null;
  onSelectDeck: (id: number) => void;
  onNewDeck: () => void;
}

const DeckList: React.FC<DeckListProps> = ({
  decks,
  cardCounts,
  selectedDeckId,
  onSelectDeck,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <ul className="flex-grow overflow-y-auto">
        {decks.map((deck) => (
          <li key={deck.id}>
            <button
              onClick={() => onSelectDeck(deck.id!)}
              className={`w-full text-left p-4 border-l-4 ${
                selectedDeckId === deck.id
                  ? 'bg-gray-200 dark:bg-gray-700 border-teal-500'
                  : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{deck.name}</h3>
                <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1">
                  {cardCounts[deck.id!] || 0}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeckList;