import React from 'react';
import { useParams } from 'react-router-dom';

const NoteDetailPage: React.FC = () => {
  const { noteId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Editing Note ID: {noteId}</h1>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <p>The Monaco Editor component for note-taking will be rendered here.</p>
      </div>
    </div>
  );
};

export default NoteDetailPage;