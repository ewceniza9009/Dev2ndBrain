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
      <div className="flex items-center">
        {hasChildren && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="mr-1 text-xs w-5">
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {node.isEndOfTag && (
          <label className={`flex items-center space-x-2 cursor-pointer ${!hasChildren ? 'ml-6' : ''}`}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="text-gray-700 dark:text-gray-400">{fullPath.split('/').pop()}</span>
          </label>
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