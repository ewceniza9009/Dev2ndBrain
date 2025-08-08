import React, { useState, useEffect } from 'react';
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
    searchTerm?: string;
}

const TagTreeNodeComponent: React.FC<TagTreeProps> = ({ node, path, selectedTags, onTagChange, level = 0, searchTerm }) => {
    const [isExpanded, setIsExpanded] = useState(!!searchTerm);
    const { openTab } = useAppStore();

    // Expand nodes if a search is active and on subsequent searches
    useEffect(() => {
        if (searchTerm) {
            setIsExpanded(true);
        }
    }, [searchTerm]);

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
    
    // Elegant icons and chevron for the new style
    const ChevronIcon = (
      <svg className={clsx("h-5 w-5 text-slate-400 transition-transform", isExpanded && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="text-sm">
        <div className="flex items-center py-1.5 px-2 rounded-md group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150">
          <div className="w-5 flex-shrink-0 flex items-center justify-center">
            {hasChildren && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                {ChevronIcon}
              </button>
            )}
          </div>

          <div className="mr-1.5 flex-shrink-0">
            {isFolder ? FolderIcon : TagIcon}
          </div>

          {node.isEndOfTag ? (
            <label className="flex-grow flex items-center space-x-1.5 cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className={clsx(
                "truncate",
                isSelected ? "text-sky-600 dark:text-sky-400 font-semibold" : "text-slate-700 dark:text-slate-300"
              )}>
                {fullPath.split('/').pop()}
            	</span>
            </label>
          ) : (
            <span className="flex-grow text-sm font-medium text-slate-500 dark:text-slate-400 cursor-pointer truncate" onClick={() => setIsExpanded(!isExpanded)}>
              {fullPath.split('/').pop()}
            </span>
          )}
          {node.isEndOfTag && (
            <button
              onClick={handleOpenInNewTab}
              className="ml-2 p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
              title={`Open graph for "${fullPath}" in a new tab`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="pl-0.5 border-l border-slate-200 dark:border-slate-700 ml-[1.125rem]">
            {childPaths.map(child => (
              <TagTreeNodeComponent
                key={child}
                node={node.children[child]}
                path={path ? `${path}/${child}` : child}
                selectedTags={selectedTags}
                onTagChange={onTagChange}
                level={level + 1}
                searchTerm={searchTerm}
            	/>
            ))}
          </div>
        )}
      </div>
    );
};

export default TagTreeNodeComponent;