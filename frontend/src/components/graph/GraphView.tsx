// frontend/src/components/graph/GraphView.tsx

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';

import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const HIERARCHY_COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#A78BFA'];
const HIERARCHY_SHAPES: ('pill' | 'rectangle')[] = ['pill', 'rectangle'];
const levelStyles = new Map<number, { color: string; shape: 'pill' | 'rectangle' }>();

const getStyleForLevel = (level: number) => {
  if (!levelStyles.has(level)) {
    const color = HIERARCHY_COLORS[level % HIERARCHY_COLORS.length];
    const shape = HIERARCHY_SHAPES[level % HIERARCHY_SHAPES.length];
    levelStyles.set(level, { color, shape });
  }
  return levelStyles.get(level)!;
};

// FIX: This function now accepts both the filtered 'visibleNotes' and 'allNotes'
// to correctly build the graph based on the active filters.
const getBaseElements = (visibleNotes: Note[], allNotes: Note[], theme: 'light' | 'dark') => {
  const allNoteMap = new Map<string, Note>(allNotes.map(note => [note.uuid, note]));
  const visibleNoteIds = new Set(visibleNotes.map(n => n.uuid));

  // Build topology from ALL notes to understand the full graph structure
  const { childToParents, parentToChildren } = allNotes.reduce(
    (acc, note) => {
      const matches = note.content.match(/\[\[(.*?)\]\]/g) || [];
      matches.forEach(match => {
        const targetUuid = match.slice(2, -2);
        if (!acc.parentToChildren.has(note.uuid)) acc.parentToChildren.set(note.uuid, []);
        acc.parentToChildren.get(note.uuid)!.push(targetUuid);
        if (!acc.childToParents.has(targetUuid)) acc.childToParents.set(targetUuid, []);
        acc.childToParents.get(targetUuid)!.push(note.uuid);
      });
      return acc;
    }, { childToParents: new Map<string, string[]>(), parentToChildren: new Map<string, string[]>() }
  );

  // Calculate hierarchy levels from ALL notes
  const nodeLevels = new Map<string, number>();
  const roots = allNotes.filter(n => !childToParents.has(n.uuid));
  const queue: { uuid: string; level: number }[] = roots.map(r => ({ uuid: r.uuid, level: 0 }));
  const visited = new Set<string>(roots.map(r => r.uuid));
  queue.forEach(({ uuid, level }) => nodeLevels.set(uuid, level));

  let head = 0;
  while (head < queue.length) {
    const { uuid, level } = queue[head++];
    const children = parentToChildren.get(uuid) || [];
    children.forEach(childUuid => {
      if (!visited.has(childUuid)) {
        visited.add(childUuid);
        nodeLevels.set(childUuid, level + 1);
        queue.push({ uuid: childUuid, level: level + 1 });
      }
    });
  }

  // Create nodes using only the filtered 'visibleNotes'
  const baseNodes: Node[] = visibleNotes.map(note => {
    const level = nodeLevels.get(note.uuid) ?? 0;
    const style = getStyleForLevel(level);
    return {
      id: note.uuid,
      type: 'custom',
      position: { x: note.x ?? 0, y: note.y ?? 0 },
      data: {
        label: note.title,
        noteId: note.id!,
        isCollapsed: note.isCollapsed,
        hasChildren: childToParents.has(note.uuid),
        isChild: childToParents.has(note.uuid),
        theme,
        shape: style.shape,
        iconColor: style.color,
        isDimmed: false,
      },
    };
  });

  // Create edges only if BOTH the source and target nodes are visible
  const baseEdges: Edge[] = [];
  visibleNotes.forEach(sourceNote => {
    const children = parentToChildren.get(sourceNote.uuid) || [];
    children.forEach(targetUuid => {
      const targetNote = allNoteMap.get(targetUuid);
      if (targetNote && visibleNoteIds.has(targetUuid)) { // Check if target is also visible
        const sourcePos = { x: sourceNote.x ?? 0, y: sourceNote.y ?? 0 };
        const targetPos = { x: targetNote.x ?? 0, y: targetNote.y ?? 0 };
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        let sourceHandle: string, targetHandle: string;
        if (Math.abs(dx) > Math.abs(dy)) {
          dx > 0 ? ([sourceHandle, targetHandle] = ['right', 'left']) : ([sourceHandle, targetHandle] = ['left', 'right']);
        } else {
          dy > 0 ? ([sourceHandle, targetHandle] = ['bottom', 'top']) : ([sourceHandle, targetHandle] = ['top', 'bottom']);
        }
        baseEdges.push({
          id: `${sourceNote.uuid}-${targetUuid}`,
          source: sourceNote.uuid,
          target: targetUuid,
          type: 'smoothstep',
          sourceHandle,
          targetHandle,
          pathOptions: { borderRadius: 20 },
        });
      }
    });
  });

  return { baseNodes, baseEdges, childToParents, parentToChildren };
};

// FIX: This component now accepts the 'notes' prop again, which is the filtered list.
const FlowComponent: React.FC<{ notes: Note[] }> = ({ notes: visibleNotes }) => {
  const allNotesFromStore = useNoteStore(state => state.notes);
  const theme = useAppStore(state => state.theme);
  const navigate = useNavigate();
  const { updateNodePosition } = useNoteStore();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // FIX: The main memo hook now depends on 'visibleNotes' to re-calculate when filters change.
  const { baseNodes, baseEdges, childToParents, parentToChildren } = useMemo(
    () => getBaseElements(visibleNotes, allNotesFromStore, theme),
    [visibleNotes, allNotesFromStore, theme]
  );
  
  const getRelatives = useCallback((uuid: string, map: Map<string, string[]>, relatives = new Set<string>()): Set<string> => {
    const connections = map.get(uuid) || [];
    connections.forEach(connUuid => {
      if (!relatives.has(connUuid)) {
        relatives.add(connUuid);
        getRelatives(connUuid, map, relatives);
      }
    });
    return relatives;
  }, []);

  const highlightedIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ancestors = getRelatives(hoveredNodeId, childToParents);
    const descendants = getRelatives(hoveredNodeId, parentToChildren);
    return new Set([hoveredNodeId, ...ancestors, ...descendants]);
  }, [hoveredNodeId, childToParents, parentToChildren, getRelatives]);

  const collapsedNoteUuids = useMemo(() => {
    const collapsed = new Set<string>();
    allNotesFromStore.forEach(note => {
      if (note.isCollapsed) {
        getRelatives(note.uuid, childToParents).forEach(id => collapsed.add(id));
      }
    });
    return collapsed;
  }, [allNotesFromStore, childToParents, getRelatives]);
  
  const finalNodes = useMemo(() => {
    return baseNodes
      .filter(node => !collapsedNoteUuids.has(node.id))
      .map(node => ({
        ...node,
        data: {
          ...node.data,
          isDimmed: hoveredNodeId !== null && !highlightedIds.has(node.id),
        },
      }));
  }, [baseNodes, collapsedNoteUuids, hoveredNodeId, highlightedIds]);

  const finalEdges = useMemo(() => {
    return baseEdges
      .filter(edge => !collapsedNoteUuids.has(edge.source) && !collapsedNoteUuids.has(edge.target))
      .map(edge => ({
        ...edge,
        hidden: collapsedNoteUuids.has(edge.source) || collapsedNoteUuids.has(edge.target),
        style: {
          stroke: theme === 'dark' ? '#4A5563' : '#CBD5E0',
          strokeWidth: 2,
          opacity: hoveredNodeId !== null && !(highlightedIds.has(edge.source) && highlightedIds.has(edge.target)) ? 0.1 : 0.7,
          transition: 'opacity 0.3s ease-in-out',
        },
      }));
  }, [baseEdges, collapsedNoteUuids, hoveredNodeId, highlightedIds, theme]);


  const [nodes, setNodes, onNodesChange] = useNodesState(finalNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(finalEdges);

  useEffect(() => {
    setNodes(finalNodes);
    setEdges(finalEdges);
  }, [finalNodes, finalEdges, setNodes, setEdges]);
  
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const target = event.target as HTMLElement;
    if (target.closest('.expand-collapse-button')) {
      const clickedNode = allNotesFromStore.find(n => n.uuid === node.id);
      if (clickedNode) {
        updateNodePosition(clickedNode.id!, clickedNode.x!, clickedNode.y!, !clickedNode.isCollapsed);
      }
    } else {
      navigate(`/notes`, { state: { selectedId: node.data.noteId } });
    }
  }, [navigate, updateNodePosition, allNotesFromStore]);
  
  const handleNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    updateNodePosition(node.data.noteId, node.position.x, node.position.y);
  }, [updateNodePosition]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const GraphViewWrapper: React.FC<{ notes: Note[] }> = ({ notes }) => {
  return (
    <ReactFlowProvider>
      <FlowComponent notes={notes} />
    </ReactFlowProvider>
  );
};

export default GraphViewWrapper;