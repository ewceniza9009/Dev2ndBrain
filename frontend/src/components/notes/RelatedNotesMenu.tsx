import React, { useMemo, useEffect, useRef } from 'react';
import type { Note } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { ArrowUturnDownIcon } from '@heroicons/react/20/solid';

interface RelatedNotesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // VITAL FIX: Allow the currentNote prop to be null
  currentNote: Note | null;
  allNotes: Note[];
}

// A recursive component to render each level of the hierarchy
const HierarchyLevel: React.FC<{
  note: Note;
  noteMap: Map<string, Note>;
  hierarchyMap: Map<string, string[]>;
  onNavigate: (note: Note) => void;
}> = ({ note, noteMap, hierarchyMap, onNavigate }) => {
  const connections = hierarchyMap.get(note.uuid) || [];

  return (
    <li className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
      <div className="flex items-center">
        <button
          onClick={() => onNavigate(note)}
          className="text-left text-sm text-teal-600 dark:text-teal-400 hover:underline group-hover:font-bold"
        >
          {note.title}
        </button>
      </div>

      {connections.length > 0 && (
        <ul className="mt-1 space-y-1">
          {connections.map(connectedUuid => {
            const connectedNote = noteMap.get(connectedUuid);
            if (!connectedNote) return null;
            // Recursively render the next level
            return (
              <HierarchyLevel
                key={connectedUuid}
                note={connectedNote}
                noteMap={noteMap}
                hierarchyMap={hierarchyMap}
                onNavigate={onNavigate}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
};


const RelatedNotesMenu: React.FC<RelatedNotesMenuProps> = ({ isOpen, onClose, currentNote, allNotes }) => {
  const { openTab } = useAppStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const { parentToChildrenMap, childToParentsMap, noteMap } = useMemo(() => {
    const parentMap = new Map<string, string[]>();
    const childMap = new Map<string, string[]>();
    const nMap = new Map<string, Note>((allNotes || []).map(n => [n.uuid, n]));

    for (const note of (allNotes || [])) {
      const matches = note.content.match(/\[\[(.*?)\]\]/g) || [];
      for (const match of matches) {
        const targetUuid = match.slice(2, -2);
        if (nMap.has(targetUuid)) {
          const children = parentMap.get(targetUuid) || [];
          parentMap.set(targetUuid, [...children, note.uuid]);
          const parents = childMap.get(note.uuid) || [];
          childMap.set(note.uuid, [...parents, targetUuid]);
        }
      }
    }
    return { parentToChildrenMap: parentMap, childToParentsMap: childMap, noteMap: nMap };
  }, [allNotes]);

  const handleNavigate = (note: Note) => {
    openTab({ type: 'note', entityId: note.id!, title: note.title });
    onClose();
  };
  
  // VITAL FIX: Add a guard clause to handle null `currentNote`
  if (!isOpen || !currentNote) return null;

  const parents = childToParentsMap.get(currentNote.uuid) || [];
  const children = parentToChildrenMap.get(currentNote.uuid) || [];

  return (
    <div
      ref={menuRef}
      className="absolute top-14 right-0 z-50 w-80 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4"
    >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Notes</h3>

        <div className="space-y-4">
            {/* Current Note Context (Non-clickable title) */}
            <div>
                <span className="font-semibold text-gray-900 dark:text-white">{currentNote.title}</span>
                {parents.length > 0 && (
                    <ul className="mt-1 space-y-1">
                        {parents.map(parentUuid => {
                            const parentNote = noteMap.get(parentUuid);
                            if (!parentNote) return null;
                            return (
                               <HierarchyLevel
                                  key={parentUuid}
                                  note={parentNote}
                                  noteMap={noteMap}
                                  hierarchyMap={childToParentsMap}
                                  onNavigate={handleNavigate}
                                />
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* Children Section */}
            {children.length > 0 && (
                <div>
                    <h4 className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <ArrowUturnDownIcon className="h-4 w-4" />
                        <span>Children (Notes that link here)</span>
                    </h4>
                    <ul className="space-y-2">
                        {children.map(childUuid => {
                            const childNote = noteMap.get(childUuid);
                            if (!childNote) return null;
                            return (
                               <li key={childUuid}>
                                   <HierarchyLevel
                                      note={childNote}
                                      noteMap={noteMap}
                                      hierarchyMap={parentToChildrenMap}
                                      onNavigate={handleNavigate}
                                    />
                               </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>

        {(parents.length === 0 && children.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No linked notes found.</p>
        )}
    </div>
  );
};

export default RelatedNotesMenu;