import React, { useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { debounce } from 'lodash-es';
import { useAppStore } from '../../stores/useAppStore';
import LinkModal from './LinkModal';
import AiModal from './AiModal'; // Import the new AI Modal

interface NoteEditorProps {
  note: Note;
  editorRef: React.MutableRefObject<any>;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, editorRef }) => {
  const updateNote = useNoteStore((state) => state.updateNote);
  const theme = useAppStore((state) => state.theme);
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false); // State for AI Modal

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const debouncedUpdate = useCallback(
    debounce((id: number, content: string) => {
      updateNote(id, { content });
    }, 2000),
    [updateNote]
  );

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && note.id) {
      debouncedUpdate(note.id, value);
    }
  };
  
  const handleInsertText = (textToInsert: string) => {
    const editor = editorRef.current;
    if (editor) {
        const currentContent = editor.getValue();
        editor.setValue(currentContent + textToInsert);
    }
  };

  const handleSelectNote = (selectedNote: Note) => {
    const linkText = `[[${selectedNote.uuid}]]`;
    const editor = editorRef.current;
    if (editor) {
      editor.executeEdits('', [{
        range: editor.getSelection(),
        text: linkText,
        forceMoveMarkers: true,
      }]);
    }
    setLinkModalOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 flex justify-end items-center space-x-2">
        {/* New AI Button */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-4 py-2 text-sm bg-indigo-600 rounded-lg text-white"
        >
          Ask AI ✨
        </button>
        <button
          onClick={() => setLinkModalOpen(true)}
          className="px-4 py-2 text-sm bg-purple-600 rounded-lg text-white"
        >
          Link Note
        </button>
      </div>
      <div className="flex-grow">
        <Editor
          key={note.id}
          height="100%"
          defaultLanguage="markdown"
          defaultValue={note.content}
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
        noteContent={editorRef.current?.getValue() || note.content}
        onInsertText={handleInsertText}
      />
    </div>
  );
};

export default NoteEditor;