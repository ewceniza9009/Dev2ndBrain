// frontend/src/components/graph/CustomNode.tsx

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { IconColor } from '../../types';

interface CustomNodeProps {
  data: {
    label: string;
    noteId: number;
    isCollapsed: boolean;
    hasChildren: boolean;
    iconColor: typeof IconColor[keyof typeof IconColor];
    theme: 'light' | 'dark';
    isChild: boolean; // NEW: To identify if the node is a child
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const { label, isCollapsed, hasChildren, iconColor, theme, isChild } = data;

  const colors = {
    background: theme === 'light' ? '#ffffff' : '#1f2937', // gray-800
    text: theme === 'light' ? '#111827' : '#f9fafb', // gray-50
    nodeBorder: theme === 'light' ? '#e5e7eb' : '#4b5563', // gray-600
  };

  // FIX: Apply a scale transform if the node is a child to make it smaller.
  const scaleClass = isChild ? 'scale-75' : 'scale-100';

  return (
    <div
      className={`p-2 rounded-full shadow-md flex items-center border border-solid transition-transform duration-300 ${
        theme === 'light' ? 'bg-white' : 'bg-gray-800'
      } ${scaleClass}`}
      style={{ borderColor: colors.nodeBorder }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center relative"
        style={{ backgroundColor: iconColor }}
      >
        {hasChildren && (
          <div
            className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-4 h-4 rounded-full flex items-center justify-center border-2 cursor-pointer expand-collapse-button"
            style={{ backgroundColor: colors.background, borderColor: colors.text }}
          >
            <span className="text-xs" style={{ color: colors.text }}>
              {isCollapsed ? '+' : '-'}
            </span>
          </div>
        )}
      </div>
      <span
        className="ml-2 font-medium text-sm cursor-pointer"
        style={{ color: colors.text }}
      >
        {label}
      </span>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(CustomNode);