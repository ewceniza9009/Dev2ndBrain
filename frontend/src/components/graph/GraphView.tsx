import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { IconType, IconColor } from '../../types';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  noteId: number;
  iconType: typeof IconType[keyof typeof IconType];
  iconColor: typeof IconColor[keyof typeof IconColor];
  isCollapsed?: boolean;
}

interface GraphViewProps {
  notes: Note[]; // Accept notes as a prop
}

const GraphView: React.FC<GraphViewProps> = ({ notes }) => {
  const ref = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const updateNodePosition = useNoteStore((state) => state.updateNodePosition);
  const allNotes = useNoteStore((state) => state.notes); // Get all notes for link resolution
  const theme = useAppStore((state) => state.theme);

  const getIconPath = (type: typeof IconType[keyof typeof IconType]) => {
    switch (type) {
      case IconType.Square:
        return d3.symbol().type(d3.symbolSquare).size(150)();
      case IconType.Circle:
      default:
        return d3.symbol().type(d3.symbolCircle).size(150)();
    }
  };

  useEffect(() => {
    if (!ref.current) return;

    // Clear previous graph
    d3.select(ref.current).selectAll("*").remove();

    if (notes.length === 0) return;

    const visibleNodeUUIDs = new Set(notes.map(n => n.uuid));

    const initialNodes: GraphNode[] = notes.map(note => {
      const nodeData = {
        ...note,
        id: note.uuid,
        iconType: note.iconType || IconType.Circle,
        iconColor: note.iconColor || IconColor.Primary,
        noteId: note.id!,
        isCollapsed: false,
      };
      if (note.x !== undefined && note.y !== undefined) {
        nodeData.x = note.x;
        nodeData.y = note.y;
        nodeData.fx = note.x;
        nodeData.fy = note.y;
      }
      return nodeData;
    });
    
    let links: { source: string; target: string }[] = [];
    const noteMap = new Map<string, Note>(allNotes.map(note => [note.uuid, note]));
    
    // Create links only if both source and target are in the filtered view
    for (const note of notes) {
      const matches = note.content.match(/\[\[(.*?)\]\]/g) || [];
      for (const match of matches) {
        const targetUuid = match.slice(2, -2);
        if (noteMap.has(targetUuid) && visibleNodeUUIDs.has(targetUuid)) {
          links.push({ source: note.uuid, target: targetUuid });
        }
      }
    }

    const width = ref.current.parentElement?.clientWidth || 800;
    const height = ref.current.parentElement?.clientHeight || 600;

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const simulation = d3.forceSimulation(initialNodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter());

    let link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    let node = g.append('g')
      .selectAll('g')
      .data(initialNodes, (d: any) => d.id)
      .join('g')
      .attr('class', 'node-group')
      .on('click', (_event: MouseEvent, d: GraphNode) => {
        navigate(`/notes`, { state: { selectedId: d.noteId } });
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          // Only unfix position if it wasn't fixed before
          if (noteMap.get(d.id)?.fx === undefined) {
              d.fx = null;
              d.fy = null;
          }
          updateNodePosition(d.noteId, d.x!, d.y!);
        }) as any);
        
    node.append('path')
      .attr('d', (d: GraphNode) => getIconPath(d.iconType))
      .attr('fill', (d: GraphNode) => d.iconColor)
      .attr('stroke', theme === 'light' ? '#E5E7EB' : '#fff')
      .attr('stroke-width', 1.5);
      
    node.append('text')
      .text((d: GraphNode) => d.title)
      .attr('x', 16)
      .attr('y', 5)
      .attr('fill', theme === 'light' ? '#111827' : 'white')
      .style('cursor', 'pointer');

    node.on('mouseover', (_event: MouseEvent, d: GraphNode) => {
      link.attr('stroke-opacity', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 1.0 : 0.2));
      link.attr('stroke', (l: any) => (l.source.id === d.id || l.target.id === d.id ? '#14B8A6' : '#999'));
      
      node.each(function(n: any) {
        const nodePath = d3.select(this).select('path');
        if (n.id === d.id) {
          nodePath.attr('fill', IconColor.Secondary).attr('d', getIconPath(IconType.Circle));
          d3.select(this).select('text').attr('font-weight', 'bold');
        } else if (links.some((l: any) => (l.source.id === n.id && l.target.id === d.id) || (l.target.id === n.id && l.source.id === d.id))) {
          nodePath.attr('fill', IconColor.Secondary).attr('d', getIconPath(IconType.Square));
          d3.select(this).select('text').attr('font-weight', 'normal');
        } else {
          d3.select(this).select('text').attr('font-weight', 'normal');
        }
      });
    });

    node.on('mouseout', () => {
      link.attr('stroke-opacity', 0.6).attr('stroke', '#999');
      node.each(function(n: any) {
        const nodePath = d3.select(this).select('path');
        nodePath.attr('d', getIconPath(n.iconType)).attr('fill', n.iconColor);
        d3.select(this).select('text').attr('font-weight', 'normal');
      });
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [notes, allNotes, navigate, theme, updateNodePosition]); // Rerun effect when filtered notes change

  return <svg ref={ref}></svg>;
};

export default GraphView;