import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex items-center flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
      {tags.map(tag => (
        <div key={tag} className="flex items-center bg-teal-600 text-white text-sm font-medium px-3 py-1 rounded-full">
          <span>{tag}</span>
          <button onClick={() => removeTag(tag)} className="ml-2 text-teal-200 hover:text-white">
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag..."
        className="bg-transparent focus:outline-none text-gray-800 dark:text-gray-300 flex-grow"
      />
    </div>
  );
};

export default TagInput;