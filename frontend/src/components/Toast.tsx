import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = type === 'success'
    ? 'bg-green-500'
    : 'bg-red-500';

  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${typeStyles} transition-all duration-300 transform ease-out`}>
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button onClick={() => { setIsVisible(false); onClose(); }} className="ml-2 text-white opacity-70 hover:opacity-100">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;