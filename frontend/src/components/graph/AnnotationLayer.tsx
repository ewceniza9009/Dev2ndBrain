import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import {
  PlusIcon,
  XMarkIcon,
  Square3Stack3DIcon as SquareIcon,
  TableCellsIcon,
  PencilSquareIcon as PencilIcon,
  ShareIcon,
  ArrowsRightLeftIcon,
  LightBulbIcon,
  StarIcon,
  BoltIcon,
  BugAntIcon,
  TableCellsIcon as AddRowIcon,
  CircleStackIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ChatBubbleBottomCenterTextIcon,
  WifiIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  FaceSmileIcon,
  PaperClipIcon,
  CloudIcon,
  CalendarIcon,
  ChartBarIcon,
  MapPinIcon,
  HandRaisedIcon,
  BellIcon,
  BookmarkIcon,
  KeyIcon,
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  AdjustmentsHorizontalIcon as InputTextIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
} from '@heroicons/react/24/solid';
import { useAppStore } from '../../stores/useAppStore';
import { useAnnotationStore } from '../../stores/useAnnotationStore';
import { nanoid } from 'nanoid';
import type { CanvasItem, Edge } from '../../types';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

// --- Context Menu Component ---
interface ContextMenuProps {
  id: string;
  x: number;
  y: number;
  onClose: () => void;
  onBringToFront: (id: string) => void;
  onBringToBack: (id: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ id, x, y, onClose, onBringToFront, onBringToBack }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{ top: y, left: x, pointerEvents: 'auto' }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBringToFront(id);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronDoubleUpIcon className="w-4 h-4 mr-2" /> Bring to Front
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBringToBack(id);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronDoubleDownIcon className="w-4 h-4 mr-2" /> Bring to Back
      </button>
    </div>
  );
};

// --- Sub-Components for Draggable Items ---
interface DraggableItemProps {
  item: CanvasItem;
  onRemove: (id: string) => void;
  startArrow: (id: string) => void;
  endArrow: (id: string) => void;
  onDragOrResize: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
}

interface DraggableAnnotationProps extends DraggableItemProps {
  onUpdateText: (id: string, text: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
}

const DraggableAnnotation: React.FC<DraggableAnnotationProps> = ({
  item,
  onUpdateText,
  onRemove,
  onResize,
  startArrow,
  endArrow,
  onDragOrResize,
  onContextMenu,
}) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={(_, data) => onDragOrResize(item.id, { x: data.x, y: data.y }, { width: item.width!, height: item.height! })}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onClick={() => endArrow(item.id)} onContextMenu={(e) => onContextMenu(e, item.id)} style={{ zIndex: item.zIndex }}>
        <ResizableBox
          height={item.height || 150}
          width={item.width || 200}
          onResizeStop={(_, data: ResizeCallbackData) => {
            onResize(item.id, data.size);
            onDragOrResize(item.id, { x: item.x, y: item.y }, data.size);
          }}
          className="shadow-xl bg-yellow-200 dark:bg-yellow-800 border-2 border-yellow-300 dark:border-yellow-700 rounded-md"
          minConstraints={[100, 100]}
        >
          <div className="drag-handle absolute top-0 left-0 w-full h-6 cursor-move" />
          <textarea
            value={item.text}
            onChange={(e) => onUpdateText(item.id, e.target.value)}
            className="w-full h-full p-2 pt-6 bg-transparent text-black dark:text-white resize-none focus:outline-none font-sans cursor-text"
            placeholder="Type your note..."
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
            title="Delete item"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              startArrow(item.id);
            }}
            className="absolute bottom-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mb-2 -mr-2"
            title="Start connector"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

interface DraggableShapeProps extends DraggableItemProps {
  onResize: (id: string, size: { width: number; height: number }) => void;
}

const DraggableShape: React.FC<DraggableShapeProps> = ({ item, onRemove, onResize, startArrow, endArrow, onDragOrResize, onContextMenu }) => {
  const nodeRef = useRef(null);

  const shapeStyle = {
    width: item.width,
    height: item.height,
    backgroundColor: item.color || 'rgba(96, 165, 250, 0.3)',
    border: '2px solid #3b82f6',
    borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'rectangle' ? '0.5rem' : '0',
    clipPath: item.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={(_, data) => onDragOrResize(item.id, { x: data.x, y: data.y }, { width: item.width!, height: item.height! })}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onClick={() => endArrow(item.id)} onContextMenu={(e) => onContextMenu(e, item.id)} style={{ zIndex: item.zIndex }}>
        <ResizableBox
          height={item.height || 100}
          width={item.width || 100}
          onResizeStop={(_, data: ResizeCallbackData) => {
            onResize(item.id, data.size);
            onDragOrResize(item.id, { x: item.x, y: item.y }, data.size);
          }}
          minConstraints={[50, 50]}
        >
          <div className="drag-handle absolute top-0 left-0 w-full h-full cursor-move" style={shapeStyle} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
            title="Delete item"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              startArrow(item.id);
            }}
            className="absolute bottom-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mb-2 -mr-2"
            title="Start connector"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

interface DraggableTableProps {
  item: CanvasItem;
  onUpdateContent: (id: string, content: string[][]) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number; columnWidths?: number[]; rowHeights?: number[] }) => void;
  startArrow: (id: string) => void;
  endArrow: (id: string) => void;
  onDragOrResize: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
}

const DraggableTable: React.FC<DraggableTableProps> = ({
  item,
  onUpdateContent,
  onRemove,
  onResize,
  startArrow,
  endArrow,
  onDragOrResize,
  onContextMenu,
}) => {
  const nodeRef = useRef(null);
  
  const [columnWidths, setColumnWidths] = useState<number[]>(item.columnWidths ?? []);
  const [rowHeights, setRowHeights] = useState<number[]>(item.rowHeights ?? []);
  const startResize = useRef<{ startX: number, startY: number, index: number, type: 'col' | 'row', initialSize: number } | null>(null);

  useEffect(() => {
    if (item.content && item.content.length > 0) {
      if (!item.columnWidths || item.columnWidths.length === 0) {
        setColumnWidths(Array(item.content[0].length).fill(100));
      }
      if (!item.rowHeights || item.rowHeights.length === 0) {
        setRowHeights(Array(item.content.length).fill(40));
      }
    }
  }, [item.content, item.columnWidths, item.rowHeights]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newContent = item.content?.map((row, rIdx) =>
      rIdx === rowIndex ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell)) : row
    );
    if (newContent) {
      onUpdateContent(item.id, newContent);
    }
  };
  
  const handleAddRow = () => {
    if (item.content && item.content.length > 0) {
      const newRow = Array(item.content[0].length).fill('');
      onUpdateContent(item.id, [...item.content, newRow]);
      setRowHeights([...rowHeights, 40]);
    }
  };

  const handleRemoveRow = (rowIndexToRemove: number) => {
    if (item.content) {
      const newContent = item.content.filter((_, rowIndex) => rowIndex !== rowIndexToRemove);
      onUpdateContent(item.id, newContent);
      setRowHeights(rowHeights.filter((_, index) => index !== rowIndexToRemove));
    }
  };

  const handleAddColumn = () => {
    if (item.content && item.content.length > 0) {
      const newContent = item.content.map(row => [...row, '']);
      onUpdateContent(item.id, newContent);
      setColumnWidths([...columnWidths, 100]);
    }
  };
  
  const handleRemoveColumn = (colIndexToRemove: number) => {
    if (item.content) {
      const newContent = item.content.map(row => row.filter((_, colIndex) => colIndex !== colIndexToRemove));
      onUpdateContent(item.id, newContent);
      setColumnWidths(columnWidths.filter((_, index) => index !== colIndexToRemove));
    }
  };

  const saveLayout = () => {
    onResize(item.id, {
      width: item.width ?? 300,
      height: item.height ?? 150,
      columnWidths,
      rowHeights,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!startResize.current) return;
    
    const { startX, startY, index, type, initialSize } = startResize.current;
    
    if (type === 'col') {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(20, initialSize + deltaX);
      const newWidths = [...columnWidths];
      newWidths[index] = newWidth;
      setColumnWidths(newWidths);
    } else { // type === 'row'
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(20, initialSize + deltaY);
      const newHeights = [...rowHeights];
      newHeights[index] = newHeight;
      setRowHeights(newHeights);
    }
  };
  
  const handleMouseUp = () => {
    document.body.style.cursor = 'default';
    if (startResize.current) {
      saveLayout();
    }
    startResize.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent, index: number, type: 'col' | 'row') => {
    e.stopPropagation();
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
    startResize.current = { 
      startX: e.clientX, 
      startY: e.clientY,
      index, 
      type,
      initialSize: type === 'col' ? columnWidths[index] : rowHeights[index]
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={(_, data) => onDragOrResize(item.id, { x: data.x, y: data.y }, { width: item.width ?? 300, height: item.height ?? 150 })}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onClick={() => endArrow(item.id)} onContextMenu={(e) => onContextMenu(e, item.id)} style={{ zIndex: item.zIndex }}>
        <div className="drag-handle absolute top-0 left-0 w-full h-8 cursor-grab bg-gray-300 dark:bg-gray-700 z-20 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 rounded-t-md">
          Drag here
        </div>
        <ResizableBox
          height={item.height ?? 150}
          width={item.width ?? 300}
          onResizeStop={(_, data: ResizeCallbackData) => {
            onResize(item.id, { ...data.size, columnWidths, rowHeights });
            onDragOrResize(item.id, { x: item.x, y: item.y }, data.size);
          }}
          className="shadow-xl bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-b-md overflow-hidden"
          minConstraints={[150, 100]}
        >
          <div className="relative w-full h-full p-2" style={{ paddingTop: '2.5rem' }}>
            <table className="w-full h-full border-collapse">
              <tbody>
                {item.content?.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ height: rowHeights[rowIndex] }}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 dark:border-gray-600 p-1 relative" style={{ width: columnWidths[colIndex] }}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="w-full h-full bg-transparent text-sm text-gray-900 dark:text-white border-none focus:outline-none"
                        />
                        {colIndex < (item.content?.[0]?.length ?? 0) - 1 && (
                          <div
                            className="absolute top-0 right-0 w-3 h-full cursor-col-resize z-30"
                            onMouseDown={(e) => handleMouseDown(e, colIndex, 'col')}
                          />
                        )}
                        {rowIndex < (item.content?.length ?? 0) - 1 && (
                          <div
                            className="absolute bottom-0 left-0 w-full h-3 cursor-row-resize z-30 -mb-1.5"
                            onMouseDown={(e) => handleMouseDown(e, rowIndex, 'row')}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResizableBox>
        {/* Buttons are now inside the main draggable div, but outside the resizable box */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2 z-40"
          title="Delete item"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startArrow(item.id);
          }}
          className="absolute bottom-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mb-2 -mr-2 z-40"
          title="Start connector"
        >
          <ShareIcon className="w-4 h-4" />
        </button>

        {/* Control bar for adding/removing rows and columns */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddRow();
            }}
            className="p-1 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
            title="Add row"
          >
            <AddRowIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddColumn();
            }}
            className="p-1 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
            title="Add column"
          >
            <PlusCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveRow(item.content!.length - 1);
            }}
            className="p-1 rounded-full bg-red-400 dark:bg-red-800 text-white hover:bg-red-500 dark:hover:bg-red-700"
            title="Remove last row"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveColumn(item.content![0].length - 1);
            }}
            className="p-1 rounded-full bg-red-400 dark:bg-red-800 text-white hover:bg-red-500 dark:hover:bg-red-700"
            title="Remove last column"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Draggable>
  );
};

interface DraggableIconProps extends DraggableItemProps {
  onContextMenu: (event: React.MouseEvent, id: string) => void;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ item, onRemove, startArrow, endArrow, onDragOrResize, onContextMenu }) => {
  const nodeRef = useRef(null);
  const IconComponent = getIconComponent(item.icon!);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={(_, data) => onDragOrResize(item.id, { x: data.x, y: data.y }, { width: 50, height: 50 })}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onClick={() => endArrow(item.id)} onContextMenu={(e) => onContextMenu(e, item.id)} style={{ zIndex: item.zIndex }}>
        <div className="drag-handle p-2 cursor-move rounded-full bg-transparent dark:bg-transparent">
          <IconComponent className="h-8 w-8 text-teal-500" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
          title="Delete item"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startArrow(item.id);
          }}
          className="absolute bottom-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mb-2 -mr-2"
          title="Start connector"
        >
          <ShareIcon className="w-4 h-4" />
        </button>
      </div>
    </Draggable>
  );
};

interface DraggableTextboxProps extends DraggableItemProps {
  onUpdateText: (id: string, text: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
}

const DraggableTextbox: React.FC<DraggableTextboxProps> = ({
  item,
  onUpdateText,
  onRemove,
  onResize,
  onDragOrResize,
  onContextMenu,
}) => {
  const nodeRef = useRef(null);
  const [inputText, setInputText] = useState(item.text || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);
    onUpdateText(item.id, newValue);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={(_, data) => onDragOrResize(item.id, { x: data.x, y: data.y }, { width: item.width!, height: item.height! })}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onContextMenu={(e) => onContextMenu(e, item.id)} style={{ zIndex: item.zIndex }}>
        <ResizableBox
          height={item.height || 40}
          width={item.width || 150}
          onResizeStop={(_, data: ResizeCallbackData) => {
            onResize(item.id, data.size);
            onDragOrResize(item.id, { x: item.x, y: item.y }, data.size);
          }}
          className="bg-transparent border-2 border-none dark:border-none rounded-md"
          minConstraints={[50, 40]}
        >
          <div className="drag-handle absolute top-0 left-0 w-full h-full cursor-move p-2 flex items-center">
            <textarea
              value={inputText}
              onChange={handleInputChange}
              className="w-full h-full bg-transparent text-gray-900 dark:text-white border-none focus:outline-none resize-none"
              placeholder="Enter text..."
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
            title="Delete item"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'BugAntIcon':
      return BugAntIcon;
    case 'BoltIcon':
      return BoltIcon;
    case 'StarIcon':
      return StarIcon;
    case 'LightBulbIcon':
      return LightBulbIcon;
    case 'CodeBracketIcon':
      return CodeBracketIcon;
    case 'DevicePhoneMobileIcon':
      return DevicePhoneMobileIcon;
    case 'ShareIcon':
      return ShareIcon;
    case 'ChatBubbleBottomCenterTextIcon':
      return ChatBubbleBottomCenterTextIcon;
    case 'DocumentTextIcon':
      return DocumentTextIcon;
    case 'WifiIcon':
      return WifiIcon;
    case 'GlobeAltIcon':
      return GlobeAltIcon;
    case 'RocketLaunchIcon':
      return RocketLaunchIcon;
    case 'FaceSmileIcon':
      return FaceSmileIcon;
    case 'PaperClipIcon':
      return PaperClipIcon;
    case 'CloudIcon':
      return CloudIcon;
    case 'CalendarIcon':
      return CalendarIcon;
    case 'ChartBarIcon':
      return ChartBarIcon;
    case 'MapPinIcon':
      return MapPinIcon;
    case 'HandRaisedIcon':
      return HandRaisedIcon;
    case 'BellIcon':
      return BellIcon;
    case 'BookmarkIcon':
      return BookmarkIcon;
    case 'KeyIcon':
      return KeyIcon;
    case 'ArrowLeftIcon':
      return ArrowLeftIcon;
    case 'ClipboardDocumentCheckIcon':
      return ClipboardDocumentCheckIcon;
    case 'InputTextIcon':
      return InputTextIcon;
    default:
      return PlusIcon;
  }
};

// --- Main AnnotationLayer Component ---
const AnnotationLayer: React.FC = () => {
  const updateXarrow = useXarrow();
  const {
    currentAnnotationState,
    filterCriteria,
    addItem,
    updateItem,
    removeItem,
    addEdge,
    removeEdge,
    updateAnnotationState,
    bringToFront,
    bringToBack,
  } = useAnnotationStore();
  const activeTab = useAppStore((state) => state.tabs.find((t) => t.id === state.activeTabId));
  const activeFilter = activeTab?.type === 'graph-filter' ? activeTab.filterCriteria : null;
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const arrowStartPoint = useRef<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContextMenu({
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    updateAnnotationState(activeFilter || '');
  }, [activeFilter, updateAnnotationState]);

  if (!activeFilter) {
    return null;
  }

  const handleAddItem = (type: CanvasItem['type'], payload?: Partial<CanvasItem>) => {
    if (!filterCriteria) return;
    const newItem: Omit<CanvasItem, 'tag'> = {
      id: nanoid(),
      type,
      x: 50,
      y: 50,
      ...payload,
    };
    addItem(filterCriteria, newItem);
  };

  const handleUpdateItem = (id: string, newProps: Partial<CanvasItem>) => {
    if (!filterCriteria) return;
    updateItem(filterCriteria, id, newProps);
    updateXarrow();
  };
  
  const handleUpdateTableContent = (id: string, content: string[][]) => {
    handleUpdateItem(id, { content });
  };

  const handleRemoveItem = (id: string) => {
    if (!filterCriteria) return;
    removeItem(filterCriteria, id);
  };

  const handleStartArrow = (id: string) => {
    arrowStartPoint.current = id;
  };

  const handleEndArrow = (id: string) => {
    if (!filterCriteria) return;
    if (arrowStartPoint.current && arrowStartPoint.current !== id) {
      addEdge(filterCriteria, { start: arrowStartPoint.current, end: id });
    }
    arrowStartPoint.current = null;
  };

  const handleSwitchArrowDirection = (edgeToSwitch: Edge) => {
    if (!filterCriteria) return;
    const newEdge = { start: edgeToSwitch.end, end: edgeToSwitch.start };
    removeEdge(filterCriteria, newEdge.start, newEdge.end);
    addEdge(filterCriteria, newEdge);
    setSelectedEdge(newEdge);
  };

  const handleItemDragOrResize = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    if (!filterCriteria) return;
    updateItem(filterCriteria, id, { x: position.x, y: position.y, width: size.width, height: size.height });
    updateXarrow();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      onClick={() => {
        handleEndArrow('');
        setSelectedEdge(null);
      }}
    >
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex flex-wrap gap-2">
        <button
          onClick={() => handleAddItem('annotation', { text: 'New Note', width: 200, height: 200 })}
          className="flex items-center space-x-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-md shadow-lg hover:bg-yellow-500 font-semibold text-sm"
          title="Add a sticky note"
        >
          <PencilIcon className="w-5 h-5" />
          <span>Text</span>
        </button>
        <button
          onClick={() => handleAddItem('textbox', { text: 'New Text', width: 150, height: 40 })}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm"
          title="Add a text input"
        >
          <InputTextIcon className="w-5 h-5" />
          <span>Input</span>
        </button>
        <button
          onClick={() => handleAddItem('shape', { shape: 'rectangle', width: 100, height: 100 })}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm"
          title="Add a rectangle"
        >
          <SquareIcon className="w-5 h-5" />
          <span>Rect</span>
        </button>
        <button
          onClick={() => handleAddItem('shape', { shape: 'circle', width: 100, height: 100 })}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm"
          title="Add a circle"
        >
          <CircleStackIcon className="w-5 h-5" />
          <span>Circle</span>
        </button>
        <button
          onClick={() => handleAddItem('shape', { shape: 'triangle', width: 100, height: 100 })}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm"
          title="Add a triangle"
        >
          <div className="w-4 h-4" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', backgroundColor: 'white' }} />
          <span>Triangle</span>
        </button>
        <button
          onClick={() => handleAddItem('table', { content: [['', ''], ['', '']], width: 300, height: 100 })}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-md shadow-lg hover:bg-gray-600 font-semibold text-sm"
          title="Add a table"
        >
          <TableCellsIcon className="w-5 h-5" />
          <span>Table</span>
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'CodeBracketIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Code"
        >
          <CodeBracketIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'DevicePhoneMobileIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Mobile"
        >
          <DevicePhoneMobileIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'ShareIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Share"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'LightBulbIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Lightbulb"
        >
          <LightBulbIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'ChatBubbleBottomCenterTextIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Thinking"
        >
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'DocumentTextIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Notes"
        >
          <DocumentTextIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'WifiIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Wifi"
        >
          <WifiIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'GlobeAltIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Web"
        >
          <GlobeAltIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'RocketLaunchIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Rocket"
        >
          <RocketLaunchIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'StarIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Star"
        >
          <StarIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'BoltIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Bolt"
        >
          <BoltIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'BugAntIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Bug"
        >
          <BugAntIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'FaceSmileIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Emoji"
        >
          <FaceSmileIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'PaperClipIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Paperclip"
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'CloudIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Cloud"
        >
          <CloudIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'CalendarIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Calendar"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'ChartBarIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Chart"
        >
          <ChartBarIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'MapPinIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Pin"
        >
          <MapPinIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'HandRaisedIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Hand"
        >
          <HandRaisedIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'BellIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Bell"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'BookmarkIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Bookmark"
        >
          <BookmarkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'KeyIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Key"
        >
          <KeyIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'ArrowLeftIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Arrow"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAddItem('icon', { icon: 'ClipboardDocumentCheckIcon' })}
          className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700"
          title="Clipboard"
        >
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
        </button>
      </div>

      <Xwrapper>
        {currentAnnotationState.items.map((item) => {
          switch (item.type) {
            case 'annotation':
              return (
                <DraggableAnnotation
                  key={item.id}
                  item={item}
                  onUpdateText={(id, text) => handleUpdateItem(id, { text })}
                  onRemove={handleRemoveItem}
                  onResize={(id, size) => handleUpdateItem(id, { width: size.width, height: size.height })}
                  onDragOrResize={handleItemDragOrResize}
                  startArrow={handleStartArrow}
                  endArrow={handleEndArrow}
                  onContextMenu={handleContextMenu}
                />
              );
            case 'textbox':
              return (
                <DraggableTextbox
                  key={item.id}
                  item={item}
                  onUpdateText={(id, text) => handleUpdateItem(id, { text })}
                  onRemove={handleRemoveItem}
                  onResize={(id, size) => handleUpdateItem(id, { width: size.width, height: size.height })}
                  onDragOrResize={handleItemDragOrResize}
                  startArrow={handleStartArrow}
                  endArrow={handleEndArrow}
                  onContextMenu={handleContextMenu}
                />
              );
            case 'shape':
              return (
                <DraggableShape
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onResize={(id, size) => handleUpdateItem(id, { width: size.width, height: size.height })}
                  onDragOrResize={handleItemDragOrResize}
                  startArrow={handleStartArrow}
                  endArrow={handleEndArrow}
                  onContextMenu={handleContextMenu}
                />
              );
            case 'table':
              return (
                <DraggableTable
                  key={item.id}
                  item={item}
                  onUpdateContent={handleUpdateTableContent} 
                  onRemove={handleRemoveItem}
                  onResize={(id, size) => handleUpdateItem(id, { width: size.width, height: size.height, columnWidths: size.columnWidths, rowHeights: size.rowHeights })}
                  onDragOrResize={handleItemDragOrResize}
                  startArrow={handleStartArrow}
                  endArrow={handleEndArrow}
                  onContextMenu={handleContextMenu}
                />
              );
            case 'icon':
              return (
                <DraggableIcon
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onDragOrResize={handleItemDragOrResize}
                  startArrow={handleStartArrow}
                  endArrow={handleEndArrow}
                  onContextMenu={handleContextMenu}
                />
              );
            default:
              return null;
          }
        })}

        {currentAnnotationState.edges.map((edge, i) => {
          const isSelected = selectedEdge?.start === edge.start && selectedEdge?.end === edge.end;
          return (
            <Xarrow
              key={`${edge.start}-${edge.end}-${i}`}
              start={edge.start}
              end={edge.end}
              path="grid"
              strokeWidth={2}
              color={isSelected ? '#3b82f6' : '#4b5563'}
              headSize={5}
              passProps={{
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedEdge(edge);
                },
                cursor: 'pointer',
              }}
              labels={
                isSelected
                  ? {
                    middle: (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchArrowDirection(edge);
                        }}
                        className="bg-white p-1 rounded-full shadow-md hover:bg-gray-200 pointer-events-auto"
                        title="Switch arrow direction"
                      >
                        <ArrowsRightLeftIcon className="w-4 h-4 text-blue-600" />
                      </button>
                    ),
                  }
                  : undefined
              }
            />
          );
        })}
      </Xwrapper>

      {contextMenu && (
        <ContextMenu
          id={contextMenu.id}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onBringToFront={() => bringToFront(activeFilter!, contextMenu.id)}
          onBringToBack={() => bringToBack(activeFilter!, contextMenu.id)}
        />
      )}
    </div>
  );
};

export default AnnotationLayer;