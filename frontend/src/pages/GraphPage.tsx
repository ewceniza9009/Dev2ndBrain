import React, { useState, useMemo } from 'react';
import GraphView from '../components/graph/GraphView';
import { useNoteStore } from '../stores/useNoteStore';
import TagTreeNodeComponent from '../components/graph/TagTree';
import AnnotationLayer from '../components/graph/AnnotationLayer';
import { useAnnotationStore } from '../stores/useAnnotationStore';

interface TagTreeNode {
    children: { [key: string]: TagTreeNode };
    isEndOfTag: boolean;
}

const GraphPage: React.FC = () => {
    const { notes, getUniqueTags } = useNoteStore();
    const { updateAnnotationState } = useAnnotationStore();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const uniqueTags = useMemo(() => getUniqueTags(), [notes]);

    const tagTree = useMemo((): TagTreeNode => {
        const root: TagTreeNode = { children: {}, isEndOfTag: false };
        uniqueTags.forEach(tag => {
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
    }, [uniqueTags]);

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

        // VITAL CHANGE: Load or update the annotation state when a tag is selected.
        if (isSelected) {
            updateAnnotationState(tag);
        } else if (selectedTags.length === 1 && selectedTags[0] === tag) {
            // If the last tag is deselected, clear the annotation state.
            updateAnnotationState('');
        }
    };

    const filteredNotes = useMemo(() => notes.filter(note => {
        if (selectedTags.length === 0) return true;
        return selectedTags.some(tag => note.tags.includes(tag));
    }), [notes, selectedTags]);

    return (
        <div className="flex h-full">
            <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
                <div>
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-2">Tags</h3>
                    <TagTreeNodeComponent
                        node={tagTree}
                        path=""
                        selectedTags={selectedTags}
                        onTagChange={handleTagChange}
                    />
                    {uniqueTags.length > 0 && (
                        <button
                            onClick={() => setSelectedTags([])}
                            className="w-full mt-4 px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow bg-white dark:bg-gray-900 rounded-lg overflow-hidden relative">
                <div className="h-full w-full">
                    <GraphView notes={filteredNotes} />
                </div>
                {/* VITAL CHANGE: The component no longer needs state props as it uses the store directly */}
                <AnnotationLayer />
            </div>
        </div>
    );
};

export default GraphPage;