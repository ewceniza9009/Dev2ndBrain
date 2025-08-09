import React, { useCallback, useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { debounce } from 'lodash-es';
import { useAppStore } from '../../stores/useAppStore';
import LinkModal from './LinkModal';
import AiModal from './AiModal';
import ImageLinkModal from './ImageLinkModal';
import { SparklesIcon, LinkIcon, PhotoIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

// --- Toolbar Components Re-integrated Here ---

const ToolbarButton = ({ onClick, title, children }: { onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
    >
        {children}
    </button>
);

const Dropdown = ({ label, title, items }: { label: React.ReactNode; title: string; items: { label: string; action: () => void }[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <ToolbarButton onClick={() => setIsOpen(!isOpen)} title={title}>
                {label}
                <ChevronDownIcon className="h-4 w-4 ml-1" />
            </ToolbarButton>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                    <ul className="py-1">
                        {items.map(item => (
                            <li key={item.label}>
                                <button
                                    onClick={() => {
                                        item.action();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface NoteEditorProps {
  note: Note;
  editorRef: React.MutableRefObject<any>;
}

interface ImageLinkPayload {
  url: string;
  width: string;
  height: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, editorRef }) => {
  const updateNote = useNoteStore((state) => state.updateNote);
  const theme = useAppStore((state) => state.theme);
  const [content, setContent] = useState(note.content);
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    setContent(note.content);
  }, [note]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const debouncedUpdate = useCallback(
    debounce((id: number, newContent: string) => {
      updateNote(id, { content: newContent });
    }, 1000),
    [updateNote]
  );

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      if (note.id) {
        debouncedUpdate(note.id, value);
      }
    }
  };

  const handleInsertText = (textToInsert: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.executeEdits('toolbar-action', [{
      range: editor.getSelection(),
      text: textToInsert,
      forceMoveMarkers: true,
    }]);
  };

  const handleSelectNote = (selectedNote: Note) => {
    const linkText = `[[${selectedNote.uuid}]]`;
    handleInsertText(linkText);
    setLinkModalOpen(false);
  };
  
  const handleAddImageLink = (payload: ImageLinkPayload) => {
    const { url, width, height } = payload;
    let textToInsert = '';

    if (width || height) {
      let attrs = `src="${url}" alt="Image from URL"`;
      if (width) attrs += ` width="${width}"`;
      if (height) attrs += ` height="${height}"`;
      textToInsert = `\n<img ${attrs}>\n`;
    } else {
      textToInsert = `\n![Image from URL](${url})\n`;
    }
    
    handleInsertText(textToInsert);
    setIsImageModalOpen(false);
  };

  // --- Toolbar Action Handlers ---
    const handleWrapSelection = (prefix: string, suffix?: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        const newText = `${prefix}${selectedText || ''}${suffix ?? prefix}`;
        
        editor.executeEdits('toolbar-action', [{ range: selection, text: newText, forceMoveMarkers: true }]);
        editor.focus();

        if (!selectedText) {
            const newPosition = {
                lineNumber: selection.startLineNumber,
                column: selection.startColumn + prefix.length,
            };
            editor.setPosition(newPosition);
        }
    };

    const handleLinePrefix = (prefix: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const selection = editor.getSelection();
        const edits = [];
        for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
            edits.push({
                range: { startLineNumber: i, startColumn: 1, endLineNumber: i, endColumn: 1 },
                text: prefix,
            });
        }
        editor.executeEdits('toolbar-action', edits);
        editor.focus();
    };

    const headingItems = [
        { label: 'Heading 1', action: () => handleLinePrefix('# ') },
        { label: 'Heading 2', action: () => handleLinePrefix('## ') },
        { label: 'Heading 3', action: () => handleLinePrefix('### ') },
        { label: 'Heading 4', action: () => handleLinePrefix('#### ') },
    ];

    const listItems = [
        { label: 'Bulleted List', action: () => handleLinePrefix('- ') },
        { label: 'Numbered List', action: () => handleLinePrefix('1. ') },
        { label: 'Task List', action: () => handleLinePrefix('- [ ] ') },
    ];
    
    const insertItems = [
        { label: 'Table', action: () => handleInsertText(`\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n`) },
        { label: 'Horizontal Rule', action: () => handleInsertText('\n\n---\n\n') },
        { label: 'Code Block', action: () => handleWrapSelection('\n```\n', '\n```\n') },
    ];

  return (
    <div className="h-full w-full flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* --- UNIFIED TOOLBAR --- */}
      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
          {/* Left-aligned Markdown tools */}
          <div className="flex flex-wrap items-center gap-1.5">
              <Dropdown label={<span className="font-bold">H</span>} title="Headings" items={headingItems} />
              <ToolbarButton onClick={(e) => { (e.currentTarget as HTMLElement).blur(); handleWrapSelection('**')}} title="Bold"><span className="font-bold">B</span></ToolbarButton>
              <ToolbarButton onClick={(e) => { (e.currentTarget as HTMLElement).blur(); handleWrapSelection('*')}} title="Italic"><span className="italic">I</span></ToolbarButton>
              <ToolbarButton onClick={(e) => { (e.currentTarget as HTMLElement).blur(); handleWrapSelection('~~')}} title="Strikethrough"><span className="line-through">S</span></ToolbarButton>
              <ToolbarButton onClick={(e) => { (e.currentTarget as HTMLElement).blur(); handleWrapSelection('`')}} title="Inline Code">{`</>`}</ToolbarButton>
              <Dropdown label="Lists" title="List Types" items={listItems} />
              <ToolbarButton onClick={(e) => { (e.currentTarget as HTMLElement).blur(); handleLinePrefix('> ')}} title="Blockquote">❝</ToolbarButton>
              <Dropdown label="Insert" title="Insert Elements" items={insertItems} />
          </div>
          {/* Right-aligned Meta tools */}
          <div className="flex items-center space-x-2">
              <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm transition-all duration-200"
                  title="Add Image from URL"
              >
                  <PhotoIcon className="h-5 w-5" />
                  <span>Add Image</span>
              </button>
              <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 shadow-md transition-all duration-200"
              >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Ask AI</span>
              </button>
              <button
                  onClick={() => setLinkModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm bg-purple-600 rounded-lg text-white hover:bg-purple-700 shadow-md transition-all duration-200"
              >
                  <LinkIcon className="h-5 w-5" />
                  <span>Link Note</span>
              </button>
          </div>
      </div>

      <div className="flex-grow">
        <Editor
          key={note.id}
          height="100%"
          defaultLanguage="markdown"
          value={content}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            fontSize: 16,
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
          }}
        />
      </div>
      
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSelectNote={handleSelectNote}
      />
      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onInsertText={(text) => handleInsertText(text)}
        noteContent={editorRef.current?.getValue() || note.content}
      />
      <ImageLinkModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onAddImageLink={handleAddImageLink}
      />
    </div>
  );
};

export default NoteEditor;