// frontend/src/components/graph/TagTree.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '../../stores/useAppStore';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

// Defines the structure of our tag tree node
interface TagTreeNode {
    children: { [key: string]: TagTreeNode };
    isEndOfTag: boolean;
}

interface TagTreeProps {
    node: TagTreeNode;
    path: string;
    selectedTags: string[];
    onTagChange: (tag: string, isSelected: boolean) => void;
    level?: number;
}

const TagTreeNodeComponent: React.FC<TagTreeProps> = ({ node, path, selectedTags, onTagChange, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { openTab } = useAppStore();
    const childPaths = Object.keys(node.children).sort();
    const hasChildren = childPaths.length > 0;

    const fullPath = path;
    const isSelected = selectedTags.includes(fullPath);
    const isFolder = !node.isEndOfTag && hasChildren;

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTagChange(fullPath, e.target.checked);
    };

    const handleOpenInNewTab = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent checkbox toggle when clicking the icon
        openTab({
            type: 'graph-filter',
            title: `Graph: ${fullPath}`,
            filterCriteria: fullPath,
        });
    };

    const ChevronIcon = (
        <svg className={clsx("h-4 w-4 text-slate-500 transition-transform", isExpanded && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );

    const FolderIcon = (
        <svg className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    );

    const TagIcon = (
        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V5c0-1.1.9-2 2-2z" />
        </svg>
    );

    return (
        <div className="relative pl-5">
            <div className="absolute left-0 top-0 h-full w-5">
                <span className="absolute left-2.5 top-0 h-full w-px bg-slate-200 dark:bg-slate-700"></span>
            </div>

            <div
                className={clsx(
                    "relative flex items-center my-0.5 group rounded-md",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
            >
                <span className="absolute left-[-10px] top-1/2 h-px w-[10px] bg-slate-200 dark:bg-slate-700"></span>

                <div className="flex items-center gap-1 py-1 pr-2">
                    {hasChildren ? (
                        <button onClick={() => setIsExpanded(!isExpanded)}>{ChevronIcon}</button>
                    ) : (
                        <div className="w-4" />
                    )}

                    {isFolder ? FolderIcon : TagIcon}
                </div>

                {node.isEndOfTag ? (
                    <label className="flex-grow flex items-center space-x-2 cursor-pointer py-1">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-4 w-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"
                        />
                        <span className={clsx(
                            "text-sm",
                            isSelected ? "text-sky-600 dark:text-sky-400 font-medium" : "text-slate-700 dark:text-slate-300"
                        )}>
                            {fullPath.split('/').pop()}
                        </span>
                    </label>
                ) : (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 py-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        {fullPath.split('/').pop()}
                    </span>
                )}

                {node.isEndOfTag && (
                    <button
                        onClick={handleOpenInNewTab}
                        className="absolute right-2 p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                        title={`Open graph for "${fullPath}" in a new tab`}
                    >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {childPaths.map(child => (
                        <TagTreeNodeComponent
                            key={child}
                            node={node.children[child]}
                            path={path ? `${path}/${child}` : child}
                            selectedTags={selectedTags}
                            onTagChange={onTagChange}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagTreeNodeComponent;