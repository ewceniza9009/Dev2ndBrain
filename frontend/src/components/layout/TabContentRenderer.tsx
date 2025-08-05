import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import NoteDetailView from '../notes/NoteDetailView';
import SnippetDetail from '../snippets/SnippetDetail';
import DeckView from '../flashcards/DeckView';
import type { Note, Snippet, Deck } from '../../types';

interface TabContentRendererProps {
  tabId: string;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({ tabId }) => {
  const tab = useAppStore(state => state.tabs.find(t => t.id === tabId));
  const getNoteById = useNoteStore(state => state.getNoteById);
  const getSnippetById = (id: number) => useSnippetStore.getState().snippets.find(s => s.id === id);
  const getDeckById = useFlashcardStore(state => state.getDeckById);

  const [entity, setEntity] = useState<Note | Snippet | Deck | undefined | null>(null);

  useEffect(() => {
    if (tab) {
      switch (tab.type) {
        case 'note':
          setEntity(getNoteById(tab.entityId));
          break;
        case 'snippet':
          setEntity(getSnippetById(tab.entityId));
          break;
        case 'deck':
          setEntity(getDeckById(tab.entityId));
          break;
      }
    }
  }, [tab, getNoteById, getDeckById]);

  if (!tab || !entity) {
    return <div className="p-8 text-gray-500">Loading content or content not found...</div>;
  }

  switch (tab.type) {
    case 'note':
      return <NoteDetailView note={entity as Note} />;
    case 'snippet':
      return <SnippetDetail snippet={entity as Snippet} />;
    case 'deck':
      return (
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-3xl text-gray-900 dark:text-white font-bold truncate mb-6">{(entity as Deck).name}</h2>
          <DeckView deck={entity as Deck} />
        </div>
      );
    default:
      return <div className="p-8 text-gray-500">Unknown tab type.</div>;
  }
};

export default TabContentRenderer;