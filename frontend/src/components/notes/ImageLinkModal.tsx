import React, { useState, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/20/solid';
interface ImageLinkPayload {
  url: string;
  width: string;
  height: string;
}

interface ImageLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImageLink: (payload: ImageLinkPayload) => void;
}

const ImageLinkModal: React.FC<ImageLinkModalProps> = ({ isOpen, onClose, onAddImageLink }) => {
  const [imageUrl, setImageUrl] = useState('');
  // NEW: State for optional width and height
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    if (isOpen) {
      setImageUrl('');
      setWidth('');
      setHeight('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onAddImageLink({ url: imageUrl.trim(), width, height });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Image from URL</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL*</label>
          <input
            type="url"
            placeholder="https://example.com/image.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 mb-4 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500"
            required
            autoFocus
          />

          {/* NEW: Width and Height inputs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (optional)</label>
              <input
                type="text"
                placeholder="e.g., 300 or 50%"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (optional)</label>
              <input
                type="text"
                placeholder="e.g., 200"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
             <button 
                type="button" 
                onClick={onClose} 
                className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
            </button>
            <button 
                type="submit" 
                disabled={!imageUrl.trim()} 
                className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-400"
              >
                <PhotoIcon className="h-5 w-5" />
              <span>Add Image</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageLinkModal;