import React, { useState, useMemo } from 'react';
import GraphView from '../components/graph/GraphView';
import TagTreeNodeComponent from '../components/graph/TagTree';
import AnnotationLayer from '../components/graph/AnnotationLayer';
import { useAnnotationStore } from '../stores/useAnnotationStore';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

interface TagTreeNode {
    children: { [key: string]: TagTreeNode };
    isEndOfTag: boolean;
}

const GraphPage: React.FC = () => {
    
    const allNotes = useLiveQuery(() => db.notes.filter(note => !note.isDeleted).toArray(), []) || [];
    const { updateAnnotationState } = useAnnotationStore();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const uniqueTags = useMemo(() => {
        const tags = allNotes.flatMap(note => note.tags || []);
        return [...new Set(tags)].sort();
    }, [allNotes]);

    const filteredTags = useMemo(() => {
        if (!searchTerm) return uniqueTags;
        return uniqueTags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [uniqueTags, searchTerm]);

    const tagTree = useMemo((): TagTreeNode => {
        const root: TagTreeNode = { children: {}, isEndOfTag: false };
        filteredTags.forEach(tag => {
            let currentNode = root;
            tag.split('/').forEach(part => {
                if (!currentNode.children[part]) {
                    currentNode.children[part] = { children: {}, isEndOfTag: false };
                }
                currentNode = currentNode.children[part];
            });
            currentNode.isEndOfTag = true;
        });
        return root;
    }, [filteredTags]);

    const handleTagChange = (tag: string, isSelected: boolean) => {
        const allDescendantTags = uniqueTags.filter(
            t => t.startsWith(tag) && (t === tag || t[tag.length] === '/')
        );

        setSelectedTags(prev => {
            let newSelection;
            if (isSelected) {
                newSelection = [...new Set([...prev, ...allDescendantTags])];
            } else {
                newSelection = prev.filter(t => !allDescendantTags.includes(t));
            }
            return newSelection;
        });

        if (isSelected) {
            updateAnnotationState(tag);
        } else if (selectedTags.length === 1 && selectedTags[0] === tag) {
            updateAnnotationState('');
        }
    };

    const filteredNotes = useMemo(() => allNotes.filter(note => {
        if (selectedTags.length === 0) return true;
        return selectedTags.some(tag => note.tags.includes(tag));
    }), [allNotes, selectedTags]);

    return (
        <div className="flex h-full bg-white dark:bg-gray-800">
            <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex-grow overflow-y-auto">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-2">Tags</h3>
                    <TagTreeNodeComponent
                        node={tagTree}
                        path=""
                        selectedTags={selectedTags}
                        onTagChange={handleTagChange}
                        searchTerm={searchTerm}
                    />
                </div>
                {uniqueTags.length > 0 && (
                    <button
                        onClick={() => {
                            setSelectedTags([]);
                            setSearchTerm('');
                        }}
                        className="w-full mt-4 px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="flex-grow bg-white dark:bg-gray-900 rounded-lg overflow-hidden relative">
                <div className="h-full w-full">
                    <GraphView visibleNotes={filteredNotes} allNotes={allNotes} />
                </div>
                <AnnotationLayer />
            </div>
        </div>
    );
};

export default GraphPage;