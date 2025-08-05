import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { visit, SKIP } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Note } from '../../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import linkPlugin from '../../lib/linkPlugin';
import DLink from './DLink';
import { useNavigate } from 'react-router-dom';
import NoteViewerSearch from './NoteViewerSearch';

const NoteViewer: React.FC<{ note: Note, fromGraph?: boolean }> = ({ note, fromGraph }) => {
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matchCount = useMemo(() => {
    if (!searchQuery || !note.content) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (note.content.match(regex) || []).length;
  }, [note.content, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchVisible(true);
      }
      if (e.key === 'Escape' && isSearchVisible) {
        e.preventDefault();
        setIsSearchVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible]);

  useEffect(() => {
    if (isSearchVisible && matchCount > 0) {
      setTimeout(() => {
        const element = document.getElementById(`search-match-${activeMatchIndex}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }, [activeMatchIndex, isSearchVisible, matchCount, searchQuery]);

  const handleNextMatch = useCallback(() => {
    if (matchCount > 0) setActiveMatchIndex(prev => (prev + 1) % matchCount);
  }, [matchCount]);

  const handlePreviousMatch = useCallback(() => {
    if (matchCount > 0) setActiveMatchIndex(prev => (prev - 1 + matchCount) % matchCount);
  }, [matchCount]);

  const rehypeHighlight = useCallback(() => {
    const transformer = (tree: Node) => {
      if (!searchQuery) return;
      let matchIndex = -1;
      visit(tree, (node: any, index?: number, parent?: Parent) => {
        if (node.type === 'element' && (node.tagName === 'pre' || node.tagName === 'code')) {
          return SKIP;
        }
        if (node.type !== 'text' || typeof index !== 'number' || !parent) {
          return;
        }
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        if (!regex.test(node.value)) return;
        regex.lastIndex = 0;
        const newNodes: any[] = [];
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(node.value)) !== null) {
          matchIndex++;
          if (match.index > lastIndex) {
            newNodes.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
          }
          newNodes.push({
            type: 'element',
            tagName: 'mark',
            properties: { id: `search-match-${matchIndex}`, className: matchIndex === activeMatchIndex ? 'active-match' : '' },
            children: [{ type: 'text', value: match[0] }]
          });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < node.value.length) {
          newNodes.push({ type: 'text', value: node.value.slice(lastIndex) });
        }
        if (newNodes.length > 0) {
          parent.children.splice(index, 1, ...newNodes);
          return [SKIP, index + newNodes.length];
        }
      });
    };
    return transformer;
  }, [searchQuery, activeMatchIndex]);

  const handleBackToGraph = () => navigate('/graph');

  return (
    <div className="prose dark:prose-invert max-w-none p-4 relative">
      {isSearchVisible && (
        <NoteViewerSearch
          query={searchQuery}
          onQueryChange={(q) => { setSearchQuery(q); setActiveMatchIndex(0); }}
          onNext={handleNextMatch}
          onPrevious={handlePreviousMatch}
          onClose={() => { setIsSearchVisible(false); setSearchQuery(''); }}
          matchCount={matchCount}
          activeMatchIndex={activeMatchIndex}
        />
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, linkPlugin]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={darcula} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          },
          a: ({ href, children, ...props }) => {
            if (href && href.startsWith('uuid:')) {
              const uuid = href.replace('uuid:', '');
              return <DLink uuid={uuid} />;
            }
            return <a href={href} {...props}>{children}</a>;
          },
        }}
      >
        {note.content}
      </ReactMarkdown>
      {fromGraph && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button onClick={handleBackToGraph} className="text-blue-500 hover:underline">
            ← Back to Graph
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteViewer;