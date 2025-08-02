import React, { useEffect, useState } from 'react';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Template } from '../../types';

const TemplateManager: React.FC = () => {
  const { templates, fetchTemplates, addTemplate, updateTemplate, deleteTemplate } = useNoteStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditedContent({ title: template.title, content: template.content });
    setIsEditing(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setEditedContent({ title: 'New Template', content: '# New Template' });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id!, editedContent);
    } else {
      await addTemplate(editedContent);
    }
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleDelete = async () => {
    if (selectedTemplate && window.confirm("Are you sure you want to delete this template?")) {
        await deleteTemplate(selectedTemplate.id!);
        setIsEditing(false);
        setSelectedTemplate(null);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
      <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Note Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="md:col-span-1">
          <button onClick={handleNewTemplate} className="w-full mb-4 px-4 py-2 font-medium leading-5 text-white transition-colors duration-150 bg-teal-600 border border-transparent rounded-lg active:bg-teal-600 hover:bg-teal-700">
            New Template
          </button>
          <ul className="space-y-2">
            {templates.map(t => (
              <li key={t.id} onClick={() => handleSelectTemplate(t)} className={`p-3 rounded-lg cursor-pointer ${selectedTemplate?.id === t.id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t.title}</h3>
              </li>
            ))}
          </ul>
        </div>

        {/* Template Editor */}
        <div className="md:col-span-2">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Template Title</label>
                <input
                  type="text"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Template Content</label>
                <textarea
                  rows={10}
                  value={editedContent.content}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 w-full p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-2">
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                {selectedTemplate && <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>}
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              Select a template to edit, or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;