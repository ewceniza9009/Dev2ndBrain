import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useNoteStore } from '../../../stores/useNoteStore';
import { useSnippetStore } from '../../../stores/useSnippetStore';
import { useAppStore } from '../../../stores/useAppStore';
import type { Project, ProjectResource } from '../../../types';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const ResourcesTab: React.FC<{ project: Project }> = ({ project }) => {
    const { updateProject } = useProjectStore();
    const { notes } = useNoteStore();
    const { snippets } = useSnippetStore();
    const { openTab } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newResource, setNewResource] = useState<Omit<ProjectResource, 'id'>>({ type: 'Note', link: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const resources = useMemo(() => Array.isArray(project.resources) ? project.resources : [], [project.resources]);
    
    const getResourceTitle = (resource: ProjectResource) => {
        if (resource.type === 'Note') {
            return notes.find(n => n.id?.toString() === resource.link)?.title || 'Note not found';
        }
        if (resource.type === 'Snippet') {
            return snippets.find(s => s.id?.toString() === resource.link)?.title || 'Snippet not found';
        }
        return resource.link;
    };
    
    const handleResourceClick = (resource: ProjectResource) => {
        const title = getResourceTitle(resource);
        if (resource.type === 'Note') {
            openTab({ type: 'note', entityId: parseInt(resource.link, 10), title });
        } else if (resource.type === 'Snippet') {
            openTab({ type: 'snippet', entityId: parseInt(resource.link, 10), title });
        }
    };

    const filteredResources = useMemo(() => {
        if (!searchTerm) return resources;
        return resources.filter(resource =>
            getResourceTitle(resource).toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [resources, searchTerm, notes, snippets]);


    const handleAddResource = () => {
        if (newResource.link.trim() === '') return;
        const newResources = [...resources, { ...newResource, id: Date.now().toString() }];
        const historyEntry = {
            timestamp: new Date(), actionType: 'Added' as const, field: 'resources',
            newValue: JSON.stringify(newResource)
        };
        updateProject(project.id!, { resources: newResources }, historyEntry);
        setIsAdding(false);
        setNewResource({ type: 'Note', link: '', description: '' });
    };

    const handleRemoveResource = (index: number) => {
        const resourceToRemove = resources[index];
        const newResources = resources.filter((_, i) => i !== index);
        const historyEntry = {
            timestamp: new Date(), actionType: 'Deleted' as const, field: 'resources',
            oldValue: JSON.stringify(resourceToRemove)
        };
        updateProject(project.id!, { resources: newResources }, historyEntry);
    };

    const inputClasses = "w-full p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500";

    const renderLinkInput = () => {
        switch (newResource.type) {
            case 'Note':
                return (
                    <select value={newResource.link} onChange={e => setNewResource({ ...newResource, link: e.target.value })} className={inputClasses}>
                        <option value="">Select a Note</option>
                        {notes.map(n => <option key={n.id} value={n.id!.toString()}>{n.title}</option>)}
                    </select>
                );
            case 'Snippet':
                return (
                    <select value={newResource.link} onChange={e => setNewResource({ ...newResource, link: e.target.value })} className={inputClasses}>
                        <option value="">Select a Snippet</option>
                        {snippets.map(s => <option key={s.id} value={s.id!.toString()}>{s.title}</option>)}
                    </select>
                );
            case 'External Link':
                return (
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={newResource.link}
                        onChange={e => setNewResource({ ...newResource, link: e.target.value })}
                        className={inputClasses}
                    />
                );
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                <button onClick={() => setIsAdding(true)} className="flex items-center space-x-1 px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Resource</span>
                </button>
                 <div className="relative w-full md:w-1/3">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            {isAdding && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 space-y-3">
                    <select value={newResource.type} onChange={e => setNewResource({ ...newResource, type: e.target.value as ProjectResource['type'], link: '' })} className={inputClasses}>
                        <option value="Note">Note</option>
                        <option value="Snippet">Snippet</option>
                        <option value="External Link">External Link</option>
                    </select>
                    {renderLinkInput()}
                    <textarea
                        placeholder="Description"
                        value={newResource.description}
                        onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                        className={inputClasses}
                    />
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 bg-gray-500 text-white rounded-md">Cancel</button>
                        <button onClick={handleAddResource} className="px-3 py-1 bg-green-600 text-white rounded-md">Save</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredResources.map((resource, index) => (
                            <tr key={resource.id || index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {resource.type === 'Note' || resource.type === 'Snippet' ? (
                                        <button onClick={() => handleResourceClick(resource)} className="text-teal-600 dark:text-teal-400 hover:underline">
                                            {getResourceTitle(resource)}
                                        </button>
                                    ) : (
                                        <span className="text-gray-900 dark:text-white">{getResourceTitle(resource)}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{resource.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{resource.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleRemoveResource(index)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredResources.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No resources match your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesTab;