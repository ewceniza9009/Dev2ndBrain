import React from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import { useNavigate } from 'react-router-dom';

interface DLinkProps {
  uuid: string;
}

const DLink: React.FC<DLinkProps> = ({ uuid }) => {
  const note = useNoteStore(state => state.notes.find(n => n.uuid === uuid));
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (note?.id) {
      navigate('/notes', { state: { selectedId: note.id } });
    }
  };

  // If the note exists, display its title. Otherwise, show a placeholder.
  const linkTitle = note ? note.title : `Note not found`;

  return (
    <a href="#" onClick={handleClick} className="text-teal-500 hover:underline font-medium">
      {linkTitle}
    </a>
  );
};

export default DLink;