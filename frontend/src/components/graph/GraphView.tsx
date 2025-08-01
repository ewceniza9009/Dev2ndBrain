import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../../stores/useNoteStore';
import { useAppStore } from '../../stores/useAppStore';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  noteId: number;
}

const GraphView: React.FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const notes = useNoteStore((state) => state.notes);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    if (!ref.current || notes.length === 0) return;

    // Clear previous graph
    d3.select(ref.current).selectAll("*").remove();

    const graphNodes: GraphNode[] = notes.map(note => ({ id: note.uuid, title: note.title, noteId: note.id! }));
    
    const links: { source: string; target: string }[] = [];
    const noteMap = new Map(notes.map(note => [note.uuid, note]));
    
    for (const note of notes) {
      const matches = note.content.match(/\[\[(.*?)\]\]/g) || [];
      for (const match of matches) {
        const targetUuid = match.slice(2, -2);
        if (noteMap.has(targetUuid)) {
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

    const simulation = d3.forceSimulation(graphNodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter());

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .selectAll('g')
      .data(graphNodes)
      .join('g')
      .call(drag(simulation) as any)
      .on('click', (_event: MouseEvent, d: GraphNode) => {
        navigate(`/notes`, { state: { selectedId: d.noteId } });
      });

    node.append('circle')
      .attr('r', 12)
      .attr('stroke', theme === 'light' ? '#E5E7EB' : '#fff')
      .attr('stroke-width', 1.5)
      .attr('fill', '#14B8A6'); // Teal color

    node.append('text')
      .text((d: GraphNode) => d.title)
      .attr('x', 16)
      .attr('y', 5)
      .attr('fill', theme === 'light' ? '#111827' : 'white')
      .style('cursor', 'pointer');
      
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<GraphNode, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag<SVGGElement, GraphNode>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }

  }, [notes, navigate, theme]);

  return <svg ref={ref}></svg>;
};

export default GraphView;