import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';

const PopularTags: React.FC = () => {
  const notes = useLiveQuery(() => db.notes.where('isDeleted').notEqual(1).toArray(), []) || [];
  const snippets = useLiveQuery(() => db.snippets.where('isDeleted').notEqual(1).toArray(), []) || [];
  const decks = useLiveQuery(() => db.decks.where('isDeleted').notEqual(1).toArray(), []) || [];

  const popularTags = useMemo(() => {
    const allTags: string[] = [];
    notes.forEach(note => allTags.push(...note.tags));
    snippets.forEach(snippet => allTags.push(...snippet.tags));
    decks.forEach(deck => allTags.push(deck.name));

    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);
  }, [notes, snippets, decks]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h2>
      <div className="flex flex-wrap gap-2">
        {popularTags.length > 0 ? (
          popularTags.map(([tag, count]) => (
            <span key={tag} className="flex items-center space-x-2 px-3 py-1 bg-teal-200 text-teal-800 dark:bg-teal-700 dark:text-teal-200 rounded-full text-sm font-medium shadow-sm">
              <span>#{tag}</span>
              <span className="text-xs bg-teal-300 dark:bg-teal-600 px-2 rounded-full text-teal-900 dark:text-white">{count}</span>
            </span>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No tags found yet.</p>
        )}
      </div>
    </div>
  );
};

export default PopularTags;