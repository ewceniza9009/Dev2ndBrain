// frontend/src/components/graph/CustomNode.tsx

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface NodeData {
  label: string;
  isDimmed: boolean;
  shape: 'pill' | 'rectangle';
  iconColor: string;
  theme: 'light' | 'dark';
  noteId: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isChild: boolean;
}

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  const { label, shape, isDimmed, iconColor, theme, isChild, hasChildren, isCollapsed } = data;

  const colors = {
    background: theme === 'light' ? '#ffffff' : '#1f2937',
    text: theme === 'light' ? '#111827' : '#f9fafb',
    nodeBorder: theme === 'light' ? '#e5e7eb' : '#4b5563',
    highlightBorder: theme === 'light' ? '#60A5FA' : '#34D399',
  };

  // Sizing logic to make conceptual parents larger
  const scaleClass = isChild ? 'scale-100' : 'scale-75';
  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

  const handleStyle = { background: 'transparent', border: 'none' };

  return (
    <div
      className={`p-3 shadow-md flex items-center border-2 border-solid ${shapeClass} ${scaleClass}`}
      style={{
        borderColor: !isDimmed ? colors.highlightBorder : colors.nodeBorder,
        background: colors.background,
        transition: 'all 0.3s ease',
        opacity: isDimmed ? 0.2 : 1,
      }}
    >
      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />

      <div className="flex items-center relative flex-shrink-0">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: iconColor }}
        />
        {/* The expand/collapse button, shown only on parent nodes */}
        {hasChildren && (
          <div
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 cursor-pointer expand-collapse-button"
            style={{ backgroundColor: colors.background, borderColor: colors.text, color: colors.text }}
          >
            <span className="text-xs font-bold">{isCollapsed ? '+' : '−'}</span>
          </div>
        )}
      </div>

      <span className="ml-3 font-semibold text-sm cursor-pointer" style={{ color: colors.text }}>
        {label}
      </span>
    </div>
  );
};

export default memo(CustomNode);