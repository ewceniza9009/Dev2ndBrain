import React, { useCallback, useState} from 'react';
import Editor from '@monaco-editor/react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import { debounce } from 'lodash-es';
import { useAppStore } from '../../stores/useAppStore';
import LinkModal from './LinkModal';
import AiModal from './AiModal';
import ImageLinkModal from './ImageLinkModal';
import { SparklesIcon, LinkIcon, PhotoIcon } from '@heroicons/react/20/solid';

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
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
    if (!editor) return;
    
    editor.executeEdits('', [{
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
  
  // UPDATED: This handler now builds an HTML <img> tag if dimensions are provided.
  const handleAddImageLink = (payload: ImageLinkPayload) => {
    const { url, width, height } = payload;
    let textToInsert = '';

    if (width || height) {
      // Build an HTML <img> tag if width or height is specified
      let attrs = `src="${url}" alt="Image from URL"`;
      if (width) attrs += ` width="${width}"`;
      if (height) attrs += ` height="${height}"`;
      textToInsert = `\n<img ${attrs}>\n`;
    } else {
      // Otherwise, use the standard Markdown syntax
      textToInsert = `\n![Image from URL](${url})\n`;
    }
    
    handleInsertText(textToInsert);
    setIsImageModalOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 flex justify-end items-center space-x-2">
        <button
          onClick={() => setIsImageModalOpen(true)}
          className="flex items-center space-x-1 px-4 py-2 text-sm bg-teal-600 rounded-lg text-white hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
          title="Add Image from URL"
        >
          <PhotoIcon className="h-5 w-5" />
          <span>Add Image</span>
        </button>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center space-x-1 px-4 py-2 text-sm bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <SparklesIcon className="h-5 w-5" />
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => setLinkModalOpen(true)}
          className="flex items-center space-x-1 px-4 py-2 text-sm bg-purple-600 rounded-lg text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <LinkIcon className="h-5 w-5" />
          <span>Link Note</span>
        </button>
      </div>
      <div className="flex-grow">
        <Editor
          key={note.id}
          height="100%"
          // ... rest of editor props
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