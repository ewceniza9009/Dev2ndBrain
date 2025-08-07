import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";
import { PlusIcon, XMarkIcon, StopIcon, CircleStackIcon, ShareIcon, ArrowsRightLeftIcon } from '@heroicons/react/20/solid';
import type { AnnotationState } from '../../stores/useAppStore';

// --- Type Definitions ---
type ItemType = 'annotation' | 'shape';
type ShapeType = 'rectangle' | 'circle';

interface CanvasItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  shape?: ShapeType;
  color?: string;
}

interface Edge {
  start: string;
  end: string;
}

// --- Draggable Item Sub-Component ---
const DraggableItem: React.FC<{
  item: CanvasItem;
  onUpdateText: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number; }) => void;
  startArrow: (id: string) => void;
  endArrow: (id: string) => void;
  onDragOrResize: () => void;
}> = ({ item, onUpdateText, onRemove, onResize, startArrow, endArrow, onDragOrResize }) => {
  const nodeRef = useRef(null);

  const itemContent = () => {
    switch (item.type) {
      case 'annotation':
        return (
          <textarea
            value={item.text}
            onChange={(e) => onUpdateText(item.id, e.target.value)}
            className="w-full h-full p-2 bg-transparent text-black dark:text-white resize-none focus:outline-none font-sans cursor-text"
            placeholder="Type something..."
          />
        );
      case 'shape':
        return <div className="w-full h-full" />;
      default:
        return null;
    }
  };

  const boxStyle = {
    backgroundColor: item.type === 'annotation' ? '' : (item.color || 'rgba(96, 165, 250, 0.3)'),
    borderRadius: item.type === 'shape' && item.shape === 'circle' ? '50%' : '0.5rem',
  };

  const boxClassName = item.type === 'annotation'
    ? "bg-yellow-200 dark:bg-yellow-800 border-2 border-yellow-300 dark:border-yellow-700"
    : "border-2 border-blue-400";

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={{ x: item.x, y: item.y }}
      bounds="parent"
      onDrag={onDragOrResize}
      onStop={onDragOrResize}
    >
      <div id={item.id} ref={nodeRef} className="absolute group pointer-events-auto" onClick={() => endArrow(item.id)}>
        <ResizableBox
          height={item.height}
          width={item.width}
          onResizeStop={(_e: React.SyntheticEvent, data: ResizeCallbackData) => {
            onResize(item.id, { width: data.size.width, height: data.size.height });
            onDragOrResize();
          }}
          className={`shadow-xl ${boxClassName}`}
          style={boxStyle}
          minConstraints={[100, 100]}
        >
          <div className="drag-handle absolute top-0 left-0 w-full h-6 cursor-move" />
          <div className="absolute top-6 left-0 right-0 bottom-0">
            {itemContent()}
          </div>
          <button
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove(item.id); }}
            className="absolute top-0 right-0 p-0.5 bg-gray-300 dark:bg-gray-900 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
            title="Delete item"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); startArrow(item.id); }}
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


// --- Main AnnotationLayer Component ---
const AnnotationLayer: React.FC<{
  initialState?: AnnotationState;
  onStateChange: (newState: AnnotationState) => void;
}> = ({ initialState }) => {
  const [items, setItems] = useState<CanvasItem[]>(initialState?.items || []);
  const [edges, setEdges] = useState<Edge[]>(initialState?.edges || []);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const arrowStartPoint = useRef<string | null>(null);
  const updateXarrow = useXarrow();



  const addItem = (type: ItemType, shape?: ShapeType) => {
    const newItem: CanvasItem = {
      id: `item-${Date.now()}`,
      type: type,
      x: 50, y: 50,
      width: type === 'annotation' ? 200 : 150,
      height: type === 'annotation' ? 200 : 150,
      text: type === 'annotation' ? 'New Note' : undefined,
      shape: shape,
      color: shape ? 'rgba(96, 165, 250, 0.3)' : undefined,
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItemText = (id: string, newText: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, text: newText } : item)));
  };

  const updateItemSize = (id: string, size: { width: number; height: number }) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, width: size.width, height: size.height } : item)));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setEdges(prev => prev.filter(edge => edge.start !== id && edge.end !== id));
  };

  const startArrow = (id: string) => {
    arrowStartPoint.current = id;
  };

  const endArrow = (id: string) => {
    if (arrowStartPoint.current && arrowStartPoint.current !== id) {
      setEdges(prev => [...prev, { start: arrowStartPoint.current!, end: id }]);
    }
    arrowStartPoint.current = null;
  };
  
  const switchArrowDirection = (edgeToSwitch: Edge) => {
    setEdges(currentEdges => currentEdges.map(edge => (edge.start === edgeToSwitch.start && edge.end === edgeToSwitch.end) ? { start: edge.end, end: edge.start } : edge));
    setSelectedEdge(null);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none" onClick={() => { endArrow(''); setSelectedEdge(null); }}>
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex space-x-2">
         <button onClick={() => addItem('annotation')} className="flex items-center space-x-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-md shadow-lg hover:bg-yellow-500 font-semibold text-sm" title="Add a sticky note"><PlusIcon className="w-5 h-5" /><span>Annotate</span></button>
         <button onClick={() => addItem('shape', 'rectangle')} className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm" title="Add a rectangle"><StopIcon className="w-5 h-5" /><span>Rectangle</span></button>
         <button onClick={() => addItem('shape', 'circle')} className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 font-semibold text-sm" title="Add a circle"><CircleStackIcon className="w-5 h-5" /><span>Circle</span></button>
      </div>
      
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          onUpdateText={updateItemText}
          onRemove={removeItem}
          onResize={updateItemSize}
          startArrow={startArrow}
          endArrow={endArrow}
          onDragOrResize={updateXarrow}
        />
      ))}
      
      {edges.map((edge, i) => {
        const isSelected = selectedEdge?.start === edge.start && selectedEdge?.end === edge.end;
        return (
          <Xarrow
            key={`${edge.start}-${edge.end}-${i}`}
            start={edge.start}
            end={edge.end}
            path="grid"
            strokeWidth={2}
            color={isSelected ? "#3b82f6" : "#4b5563"}
            headSize={5}
            passProps={{ onClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedEdge(edge); }, cursor: 'pointer' }}
            labels={ isSelected ? { middle: ( <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); switchArrowDirection(edge); }} className="bg-white p-1 rounded-full shadow-md hover:bg-gray-200 pointer-events-auto" title="Switch arrow direction"><ArrowsRightLeftIcon className="w-4 h-4 text-blue-600" /></button> ) } : undefined }
          />
        );
      })}
    </div>
  );
};

const AnnotationLayerWrapper: React.FC<{
  initialState?: AnnotationState;
  onStateChange: (newState: AnnotationState) => void;
}> = ({ initialState, onStateChange }) => (
  <Xwrapper>
    <AnnotationLayer initialState={initialState} onStateChange={onStateChange} />
  </Xwrapper>
);

export default AnnotationLayerWrapper;