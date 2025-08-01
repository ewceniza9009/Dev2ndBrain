import React, { useState, useEffect, useMemo, isValidElement } from 'react';
import type { ReactElement } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import { useNavigate } from 'react-router-dom';

interface ValueProps {
  value: string;
}

function isElementWithValueProp(element: any): element is ReactElement<ValueProps> {
  return isValidElement(element) && typeof element.props === 'object' && element.props !== null && typeof (element.props as any).value === 'string';
}

interface DLinkProps {
  uuid: string;
  children: React.ReactNode;
}

const DLink: React.FC<DLinkProps> = ({ uuid, children }) => {
  const note = useNoteStore(state => state.notes.find(n => n.uuid === uuid));
  const navigate = useNavigate();

  const defaultTitle = useMemo(() => {
    if (Array.isArray(children)) {
      const firstChild = children[0];
      if (isElementWithValueProp(firstChild)) {
        return firstChild.props.value;
      }
    } else if (typeof children === 'string') {
      return children;
    }
    return `[[${uuid}]]`;
  }, [children, uuid]);

  const [title, setTitle] = useState(defaultTitle);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
    }
  }, [note]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // This is the crucial line to prevent page refresh
    if (note?.id) {
      navigate('/notes', { state: { selectedId: note.id } });
    }
  };

  return (
    <a href="#" onClick={handleClick} className="text-blue-500 hover:underline">
      {title}
    </a>
  );
};

export default DLink;