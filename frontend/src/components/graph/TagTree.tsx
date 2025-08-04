// frontend/src/components/graph/TagTree.tsx

import React, { useState } from 'react';

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
}

const TagTreeNodeComponent: React.FC<TagTreeProps> = ({ node, path, selectedTags, onTagChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const childPaths = Object.keys(node.children).sort();
  const hasChildren = childPaths.length > 0;

  const fullPath = path;
  const isSelected = selectedTags.includes(fullPath);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTagChange(fullPath, e.target.checked);
  };

  return (
    <div className="ml-4">
      {/* FIX: Improved layout to correctly display both tags and folder-like parent tags */}
      <div className="flex items-center my-1">
        {hasChildren ? (
          <button onClick={() => setIsExpanded(!isExpanded)} className="mr-1 text-xs w-5 flex-shrink-0">
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <div className="w-5 mr-1 flex-shrink-0" /> // Placeholder for alignment
        )}

        {node.isEndOfTag ? (
          <label className="flex-grow flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="form-checkbox h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-gray-700 dark:text-gray-300">{fullPath.split('/').pop()}</span>
          </label>
        ) : (
          // This is an intermediate node (a "folder"), not a tag itself.
          // We display its name and add margin to align it with the text of actual tags.
          <span className="text-gray-500 dark:text-gray-400 ml-6">{fullPath.split('/').pop()}</span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagTreeNodeComponent;