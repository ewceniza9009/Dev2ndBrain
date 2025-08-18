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
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';

import CustomNode from './CustomNode';
import NotePreviewModal from './NotePreviewModal';

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

const getBaseElements = (visibleNotes: Note[], allNotes: Note[], theme: 'light' | 'dark') => {
  const allNotesSafe = allNotes || [];
  const visibleNotesSafe = visibleNotes || [];

  console.log(visibleNotes);

  const allNoteMap = new Map<string, Note>(allNotesSafe.map(note => [note.uuid, note]));
  const visibleNoteIds = new Set(visibleNotesSafe.map(n => n.uuid));

  const { childToParents, parentToChildren } = allNotesSafe.reduce(
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

  const nodeLevels = new Map<string, number>();
  const roots = allNotesSafe.filter(n => !childToParents.has(n.uuid));
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

  const baseNodes: Node[] = visibleNotesSafe.map(note => {
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

  const baseEdges: Edge[] = [];
  visibleNotesSafe.forEach(sourceNote => {
    const children = parentToChildren.get(sourceNote.uuid) || [];
    children.forEach(targetUuid => {
      const targetNote = allNoteMap.get(targetUuid);
      if (targetNote && visibleNoteIds.has(targetUuid)) {
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

interface FlowComponentProps {
  visibleNotes: Note[];
  allNotes: Note[];
}

const FlowComponent: React.FC<FlowComponentProps> = ({ visibleNotes, allNotes }) => {
  const theme = useAppStore(state => state.theme);
  const { updateNodePosition } = useNoteStore();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const { baseNodes, baseEdges, childToParents, parentToChildren } = useMemo(
    () => getBaseElements(visibleNotes, allNotes, theme),
    [visibleNotes, allNotes, theme]
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
    (allNotes || []).forEach(note => {
      if (note.isCollapsed) {
        getRelatives(note.uuid, childToParents).forEach(id => collapsed.add(id));
      }
    });
    return collapsed;
  }, [allNotes, childToParents, getRelatives]);
  
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
      const clickedNote = (allNotes || []).find(n => n.uuid === node.id);
      if (clickedNote) {
        updateNodePosition(clickedNote.id!, clickedNote.x!, clickedNote.y!, !clickedNote.isCollapsed);
      }
    } else {
        const clickedNote = (allNotes || []).find(n => n.uuid === node.id);
        if (clickedNote) {
            setPreviewNote(clickedNote);
            setIsModalOpen(true);
        }
    }
  }, [updateNodePosition, allNotes]);
  
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
      <NotePreviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} note={previewNote} />
    </div>
  );
};

interface GraphViewWrapperProps {
  visibleNotes: Note[];
  allNotes: Note[];
}

const GraphViewWrapper: React.FC<GraphViewWrapperProps> = ({ visibleNotes, allNotes }) => {
  return (
    <ReactFlowProvider>
      <FlowComponent visibleNotes={visibleNotes} allNotes={allNotes} />
    </ReactFlowProvider>
  );
};

export default GraphViewWrapper;