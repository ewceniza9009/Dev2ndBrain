import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import NoteDetailView from '../notes/NoteDetailView';
import SnippetDetail from '../snippets/SnippetDetail';
import DeckView from '../flashcards/DeckView';
import FlashcardPlayer from '../flashcards/FlashcardPlayer';
import ConfirmationModal from '../ConfirmationModal';
import GraphView from '../graph/GraphView';
import AnnotationLayer from '../graph/AnnotationLayer';
import { TrashIcon, PlayCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useAnnotationStore } from '../../stores/useAnnotationStore';

interface TabContentRendererProps {
    tabId: string;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({ tabId }) => {
    const { tabs, closeTab } = useAppStore();
    const { updateAnnotationState } = useAnnotationStore();
    const tab = tabs.find(t => t.id === tabId);

    const [view, setView] = useState<'list' | 'review'>('list');
    const [reviewMode, setReviewMode] = useState<'due' | 'all'>('due');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isEditingDeckName, setIsEditingDeckName] = useState(false);
    const [editedDeckName, setEditedDeckName] = useState('');

    const note = useNoteStore(state => tab?.type === 'note' ? state.notes.find(n => n.id === tab.entityId) : null);
    const allNotes = useNoteStore(state => state.notes);
    const snippet = useSnippetStore(state => tab?.type === 'snippet' ? state.snippets.find(s => s.id === tab.entityId) : null);
    const deck = useFlashcardStore(state => tab?.type === 'deck' ? state.decks.find(d => d.id === tab.entityId) : null);
    const { deleteDeck, updateDeck } = useFlashcardStore();

    if (!tab) {
        return <div className="p-8 text-gray-500">Loading tab...</div>;
    }

    const handleEditDeckName = () => {
        if (deck) {
            setIsEditingDeckName(true);
            setEditedDeckName(deck.name);
        }
    };
    const handleSaveDeckName = async () => {
        if (deck?.id && editedDeckName.trim()) {
            await updateDeck(deck.id, editedDeckName.trim());
            setIsEditingDeckName(false);
        }
    };
    const handleConfirmDeleteDeck = () => {
        if (deck?.id) {
            deleteDeck(deck.id);
            closeTab(tab.id);
        }
    };

    switch (tab.type) {
        case 'note':
            return note ? <NoteDetailView note={note} /> : <div className="p-8 text-gray-500">Note not found...</div>;

        case 'snippet':
            return snippet ? <SnippetDetail snippet={snippet} /> : <div className="p-8 text-gray-500">Snippet not found...</div>;

        case 'deck':
            if (!deck) return <div className="p-8 text-gray-500">Deck not found...</div>;
            if (view === 'review') {
                return (
                    <div className="p-6">
                        <FlashcardPlayer deckId={deck.id!} reviewMode={reviewMode} onFinish={() => setView('list')} />
                    </div>
                );
            }
            return (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3 flex-grow pr-4">
                            {!isEditingDeckName ? (
                                <>
                                    <h2 className="text-3xl text-gray-900 dark:text-white font-bold truncate">{deck.name}</h2>
                                    <button onClick={handleEditDeckName} className="text-gray-500 hover:text-gray-700 dark:hover:text-white flex-shrink-0">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <input type="text" value={editedDeckName} onChange={(e) => setEditedDeckName(e.target.value)} className="text-3xl font-bold bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none border border-gray-300 dark:border-gray-600" onKeyDown={(e) => e.key === 'Enter' && handleSaveDeckName()} autoFocus />
                            )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            {isEditingDeckName ? (
                                <>
                                    <button onClick={handleSaveDeckName} className="flex items-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
                                        <CheckIcon className="h-5 w-5" /><span>Save</span>
                                    </button>
                                    <button onClick={() => setIsEditingDeckName(false)} className="flex items-center space-x-2 bg-gray-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200">
                                        <XMarkIcon className="h-5 w-5" /><span>Cancel</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setReviewMode('all'); setView('review'); }} className="flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"><PlayCircleIcon className="h-5 w-5" /><span>Review All Cards</span></button>
                                    <button onClick={() => { setReviewMode('due'); setView('review'); }} className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200"><PlayCircleIcon className="h-5 w-5" /><span>Review Due</span></button>
                                    <button onClick={() => setIsConfirmModalOpen(true)} className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"><TrashIcon className="h-5 w-5" /><span>Delete</span></button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <DeckView deck={deck} />
                    </div>
                    <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDeleteDeck} title="Confirm Deck Deletion" message={`Are you sure you want to delete the deck "${deck.name}"? This action cannot be undone.`} />
                </div>
            );

        case 'graph-filter': {
            if (!tab.filterCriteria) {
                return <div className="p-8 text-gray-500">Error: No filter criteria for this graph tab.</div>;
            }
            const filteredNotes = allNotes.filter(note => note.tags.includes(tab.filterCriteria!));

            // VITAL CHANGE: Use the new annotation store to manage state
            updateAnnotationState(tab.filterCriteria);

            return (
                <div className="h-full w-full relative">
                    <div className="h-full w-full">
                        <GraphView notes={filteredNotes} />
                    </div>
                    {/* VITAL CHANGE: The component no longer needs state props as it uses the store directly */}
                    <AnnotationLayer />
                </div>
            );
        }

        default:
            return <div className="p-8 text-gray-500">Unknown tab type.</div>;
    }
};

export default TabContentRenderer;