import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { debounce } from 'lodash-es';
import { useAppStore } from '../../stores/useAppStore';

interface NoteEditorProps {
  note: Note;
  editorRef: React.MutableRefObject<any>;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, editorRef }) => {
  const updateNote = useNoteStore((state) => state.updateNote);
  const theme = useAppStore((state) => state.theme);

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

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
  );
};

export default NoteEditor;