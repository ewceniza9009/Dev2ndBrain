// frontend/src/components/graph/CustomNode.tsx

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { type IconColor } from '../../types';

interface NodeData {
  label: string;
  noteId: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  iconColor: typeof IconColor[keyof typeof IconColor];
  theme: 'light' | 'dark';
  isChild: boolean;
}

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  const { label, isCollapsed, hasChildren, iconColor, theme, isChild } = data;

  const colors = {
    background: theme === 'light' ? '#ffffff' : '#1f2937',
    text: theme === 'light' ? '#111827' : '#f9fafb',
    nodeBorder: theme === 'light' ? '#e5e7eb' : '#4b5563',
  };

  const scaleClass = isChild ? 'scale-100' : 'scale-75';
  
  // A simple style for our invisible handles
  const handleStyle = { background: 'transparent', border: 'none' };

  return (
    <div
      className={`p-2 rounded-full shadow-md flex items-center border border-solid transition-transform duration-300 ${
        theme === 'light' ? 'bg-white' : 'bg-gray-800'
      } ${scaleClass}`}
      style={{ borderColor: colors.nodeBorder }}
    >
      {/* NEW: We now have handles on all four sides, each with a unique ID.
        This allows us to programmatically choose which one to connect to.
      */}
      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />


      {/* The rest of your node's visual structure is unchanged */}
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
    </div>
  );
};

export default memo(CustomNode);