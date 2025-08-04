// frontend/src/components/graph/GraphView.tsx

import React, { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from 'reactflow';

import type {
  Node,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { IconColor } from '../../types';

import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const getNodesAndEdges = (visibleNotes: Note[], allNotes: Note[], theme: 'light' | 'dark') => {
  const allNoteMap = new Map<string, Note>(allNotes.map(note => [note.uuid, note]));

  const getDescendants = (startNodeId: string, descendants = new Set<string>()) => {
    const children = allNotes.filter(n => n.content.includes(`[[${startNodeId}]]`));
    children.forEach(child => {
      if (!descendants.has(child.uuid)) {
        descendants.add(child.uuid);
        getDescendants(child.uuid, descendants);
      }
    });
    return descendants;
  };
  
  const collapsedNoteUuids = new Set<string>();
  allNotes.forEach(note => {
    if (note.isCollapsed) {
      getDescendants(note.uuid).forEach(childId => collapsedNoteUuids.add(childId));
    }
  });

  const notesToRender = visibleNotes.filter(note => !collapsedNoteUuids.has(note.uuid));
  const visibleNodeIds = new Set(notesToRender.map(n => n.uuid));

  const childIds = new Set<string>();
  notesToRender.forEach(sourceNote => {
    const matches = sourceNote.content.match(/\[\[(.*?)\]\]/g) || [];
    matches.forEach(match => {
        const targetUuid = match.slice(2, -2);
        if (visibleNodeIds.has(targetUuid)) {
            childIds.add(targetUuid);
        }
    });
  });

  const nodes: Node[] = notesToRender.map(note => {
    const isCollapsed = allNoteMap.get(note.uuid)?.isCollapsed || false;
    const hasChildren = allNotes.some(n => n.content.includes(`[[${note.uuid}]]`));
    const isChild = childIds.has(note.uuid);

    return {
      id: note.uuid,
      type: 'custom',
      data: {
        label: note.title,
        noteId: note.id!,
        isCollapsed,
        hasChildren,
        iconColor: note.iconColor || IconColor.Primary,
        theme,
        isChild,
      },
      position: { x: note.x ?? 0, y: note.y ?? 0 },
      draggable: true,
    };
  });

  const edges: any[] = [];
  notesToRender.forEach(sourceNote => {
    const matches = sourceNote.content.match(/\[\[(.*?)\]\]/g) || [];
    matches.forEach(match => {
      const targetUuid = match.slice(2, -2);
      const targetNote = allNoteMap.get(targetUuid);
      if (targetNote && visibleNodeIds.has(targetNote.uuid)) {
        
        const sourcePos = { x: sourceNote.x ?? 0, y: sourceNote.y ?? 0 };
        const targetPos = { x: targetNote.x ?? 0, y: targetNote.y ?? 0 };

        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;

        let sourceHandle: string;
        let targetHandle: string;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            sourceHandle = 'right';
            targetHandle = 'left';
          } else {
            sourceHandle = 'left';
            targetHandle = 'right';
          }
        } else {
          if (dy > 0) {
            sourceHandle = 'bottom';
            targetHandle = 'top';
          } else {
            sourceHandle = 'top';
            targetHandle = 'bottom';
          }
        }
        
        edges.push({
          id: `${sourceNote.uuid}-${targetUuid}`,
          source: sourceNote.uuid,
          target: targetUuid,
          type: 'smoothstep',
          animated: false,
          sourceHandle,
          targetHandle,
          // NEW: This single line rounds the corners of the edges!
          pathOptions: { borderRadius: 20 },
        });
      }
    });
  });

  return { nodes, edges };
};

interface GraphViewProps {
  notes: Note[];
}

const FlowComponent: React.FC<GraphViewProps> = ({ notes }) => {
  const { fitView } = useReactFlow();
  const allNotesFromStore = useNoteStore((state) => state.notes);
  const theme = useAppStore((state) => state.theme);
  const navigate = useNavigate();
  const { updateNodePosition } = useNoteStore();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => getNodesAndEdges(notes, allNotesFromStore, theme), [notes, allNotesFromStore, theme]);
  
  const [nodesState, setNodes] = useNodesState(initialNodes);
  const [edgesState, setEdges] = useEdgesState(initialEdges);

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getNodesAndEdges(notes, allNotesFromStore, theme);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [notes, allNotesFromStore, theme, setNodes, setEdges]);

  useEffect(() => {
    if (nodesState.length > 0) {
      fitView();
    }
  }, [nodesState, fitView]);

  const handleNodeDragStop = useCallback(
    (_event: any, node: Node) => {
        if (!node.data) return;
        // FIX: Persist the node's new x/y position after dragging.
        // We no longer pass fx/fy, as this was causing the dragging issue.
        updateNodePosition(node.data.noteId, node.position.x, node.position.y);
    },
    [updateNodePosition]
  );

  const handleNodeClick = useCallback(
    (event: any, node: Node) => {
        if (!node.data) return;
        const isCollapseButton = event.target?.closest('.expand-collapse-button');
        if (isCollapseButton) {
            updateNodePosition(node.data.noteId, node.position.x!, node.position.y!, !node.data.isCollapsed);
        } else {
            navigate(`/notes`, { state: { selectedId: node.data.noteId } });
        }
    },
    [navigate, updateNodePosition]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className={`react-flow-${theme}`}
      >
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const GraphViewWrapper: React.FC<GraphViewProps> = ({ notes }) => {
  return (
    <ReactFlowProvider>
      <FlowComponent notes={notes} />
    </ReactFlowProvider>
  );
};

export default GraphViewWrapper;