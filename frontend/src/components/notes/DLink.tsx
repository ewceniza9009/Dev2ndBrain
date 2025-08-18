import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { useAppStore } from '../../stores/useAppStore';

interface DLinkProps {
  uuid: string;
}

const DLink: React.FC<DLinkProps> = ({ uuid }) => {
  const note = useLiveQuery(
    () => db.notes.where('uuid').equals(uuid).first(),
    [uuid]
  );
  
  const { openTab } = useAppStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (note?.id) {
      // Use openTab for a better user experience instead of replacing the whole view
      openTab({ type: 'note', entityId: note.id, title: note.title });
    }
  };

  // If the note exists, display its title. Otherwise, show a placeholder.
  const linkTitle = note ? note.title : `Note not found`;

  return (
    <a 
      href="#" 
      onClick={handleClick} 
      className="text-teal-600 dark:text-teal-400 hover:underline font-medium bg-teal-100/50 dark:bg-teal-900/50 px-1 py-0.5 rounded-md"
      title={linkTitle}
    >
      {linkTitle}
    </a>
  );
};

export default DLink;