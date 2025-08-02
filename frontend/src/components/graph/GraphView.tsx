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
  notes: Note[];
}

const GraphView: React.FC<GraphViewProps> = ({ notes }) => {
  const ref = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const updateNodePosition = useNoteStore((state) => state.updateNodePosition);
  const allNotes = useNoteStore((state) => state.notes);
  const theme = useAppStore((state) => state.theme);

  // Use a ref to hold the simulation and other D3 objects
  const d3Ref = useRef<{
    simulation: d3.Simulation<GraphNode, undefined> | null;
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
  }>({
    simulation: null,
    g: null
  });

  const getIconPath = (type: typeof IconType[keyof typeof IconType]) => {
    switch (type) {
      case IconType.Square:
        return d3.symbol().type(d3.symbolSquare).size(150)();
      case IconType.Circle:
      default:
        return d3.symbol().type(d3.symbolCircle).size(150)();
    }
  };

  // EFFECT 1: INITIALIZATION
  // This runs only ONCE when the component mounts. It sets up the SVG, zoom, and simulation.
  useEffect(() => {
    if (!ref.current) return;

    const width = ref.current.parentElement?.clientWidth || 800;
    const height = ref.current.parentElement?.clientHeight || 600;

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Clear previous content
    svg.selectAll('g').remove();
    const g = svg.append('g');
    d3Ref.current.g = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom as any);

    const simulation = d3.forceSimulation<GraphNode>()
      .force('link', d3.forceLink<GraphNode, { source: string; target: string }>()
        .id((d) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter());

    d3Ref.current.simulation = simulation;

    // Cleanup function for when the component unmounts
    return () => {
      simulation.stop();
    };

  }, []); // Empty dependency array means this runs only once

  // EFFECT 2: UPDATES
  // This runs whenever `notes` or other specified dependencies change.
  useEffect(() => {
    const { simulation, g } = d3Ref.current;
    if (!simulation || !g) return;

    const visibleNodeUUIDs = new Set(notes.map(n => n.uuid));
    const noteMap = new Map<string, Note>(allNotes.map(note => [note.uuid, note]));
    
    let links: { source: string; target: string }[] = [];
    for (const note of notes) {
      const matches = note.content.match(/\[\[(.*?)\]\]/g) || [];
      for (const match of matches) {
        const targetUuid = match.slice(2, -2);
        if (noteMap.has(targetUuid) && visibleNodeUUIDs.has(targetUuid)) {
          links.push({ source: note.uuid, target: targetUuid });
        }
      }
    }

    const initialNodes: GraphNode[] = notes.map(note => {
      const existingNode = simulation.nodes().find(n => n.id === note.uuid);
      
      const nodeData: GraphNode = {
        id: note.uuid,
        title: note.title,
        noteId: note.id!,
        iconType: note.iconType || IconType.Circle,
        iconColor: note.iconColor || IconColor.Primary,
        isCollapsed: false,
        x: existingNode?.x,
        y: existingNode?.y,
        fx: existingNode?.fx,
        fy: existingNode?.fy,
      };

      if (nodeData.x === undefined || nodeData.y === undefined) {
        const parentLink = links.find(l => l.target === nodeData.id);
        if (parentLink) {
          const parentNote = allNotes.find(n => n.uuid === parentLink.source);
          if (parentNote && parentNote.x !== undefined && parentNote.y !== undefined) {
            nodeData.x = parentNote.x + Math.random() * 50 - 25;
            nodeData.y = parentNote.y + Math.random() * 50 - 25;
          } else {
            nodeData.x = 0;
            nodeData.y = 0;
          }
        } else {
          nodeData.x = 0;
          nodeData.y = 0;
        }
      }
      return nodeData;
    });

    // UPDATE LINKS
    const link = g.selectAll<SVGLineElement, { source: string; target: string }>('line')
      .data(links, d => `${d.source}-${d.target}`)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);
    
    // UPDATE NODES
    const node = g.selectAll<SVGGElement, GraphNode>('.node-group')
      .data(initialNodes, d => d.id)
      .join(
        enter => {
          const nodeEnter = enter.append('g')
            .attr('class', 'node-group')
            .on('click', (_event: MouseEvent, d: GraphNode) => {
              navigate(`/notes`, { state: { selectedId: d.noteId } });
            })
            .call(d3.drag<SVGGElement, GraphNode>()
              .on("start", (event: any, d: any) => {
                event.sourceEvent.stopPropagation();
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
                if (noteMap.get(d.id)?.fx === undefined) {
                    d.fx = null;
                    d.fy = null;
                }
                updateNodePosition(d.noteId, d.x!, d.y!);
              }) as any);
          
          nodeEnter.append('path')
            .attr('d', (d: GraphNode) => getIconPath(d.iconType))
            .attr('fill', (d: GraphNode) => d.iconColor)
            .attr('stroke', theme === 'light' ? '#E5E7EB' : '#fff')
            .attr('stroke-width', 1.5);

          nodeEnter.append('text')
            .text((d: GraphNode) => d.title)
            .attr('x', 16)
            .attr('y', 5)
            .attr('fill', theme === 'light' ? '#111827' : 'white')
            .style('cursor', 'pointer');
            
          return nodeEnter;
        },
        update => update,
        exit => exit.remove()
      )
      .on('mouseover', (_event: MouseEvent, d: GraphNode) => {
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
      })
      .on('mouseout', () => {
        link.attr('stroke-opacity', 0.6).attr('stroke', '#999');
        node.each(function(n: any) {
          const nodePath = d3.select(this).select('path');
          nodePath.attr('d', getIconPath(n.iconType)).attr('fill', n.iconColor);
          d3.select(this).select('text').attr('font-weight', 'normal');
        });
      });

    simulation.nodes(initialNodes);
    (simulation.force('link') as d3.ForceLink<GraphNode, { source: string; target: string }>).links(links);
    simulation.alpha(1).restart();

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [notes, allNotes, navigate, theme, updateNodePosition]);

  return <svg ref={ref}></svg>;
};

export default GraphView;