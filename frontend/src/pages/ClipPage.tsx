import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';

const ClipPage: React.FC = () => {
  const [status, setStatus] = useState('Clipping...');
  const location = useLocation();
  const navigate = useNavigate();
  const { addNote } = useNoteStore();

  useEffect(() => {
    const processClip = async () => {
      const params = new URLSearchParams(location.search);
      const title = params.get('title');
      const content = params.get('content');
      const source = params.get('source');

      if (!title || !content) {
        setStatus('Error: Missing title or content.');
        return;
      }

      // Format the content with the source URL
      const fullContent = `> Source: [${source}](${source})\n\n---\n\n${content}`;
      
      try {
        const newNote = await addNote({
          title: title,
          content: fullContent,
          tags: ['clipped'],
        });
        
        setStatus('Successfully clipped!');

        // After a delay, redirect to the new note
        setTimeout(() => {
          if (newNote?.id) {
            navigate('/notes', { state: { selectedId: newNote.id } });
          } else {
            navigate('/notes');
          }
        }, 1500);

      } catch (err) {
        console.error("Failed to save clip:", err);
        setStatus('Error: Could not save the clip.');
      }
    };

    processClip();
  }, [location, addNote, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Dev2ndBrain Clipper
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        {status}
      </p>
      {status.includes('Successfully') && (
        <p className="mt-4 text-gray-500">You will be redirected shortly...</p>
      )}
    </div>
  );
};

export default ClipPage;