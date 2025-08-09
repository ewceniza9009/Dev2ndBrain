import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import type { Project, ProjectFeature } from '../../../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const FeaturesTab: React.FC<{ project: Project }> = ({ project }) => {
    const { updateProject } = useProjectStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentFeature, setCurrentFeature] = useState<Omit<ProjectFeature, 'id'>>({ name: '', type: 'New Feature', status: 'Planned', description: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const features = useMemo(() => Array.isArray(project.features) ? project.features : [], [project.features]);

    const filteredFeatures = useMemo(() => {
        if (!searchTerm) return features;
        return features.filter(feature =>
            feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feature.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [features, searchTerm]);
    
    const handleSave = (index?: number) => {
        let newFeatures;
        let historyEntry;

        if (index !== undefined) { 
            const oldFeature = features[index];
            newFeatures = [...features];
            newFeatures[index] = { ...currentFeature, id: newFeatures[index].id };
            historyEntry = {
                timestamp: new Date(), actionType: 'Updated' as const, field: 'features',
                oldValue: JSON.stringify(oldFeature), newValue: JSON.stringify(currentFeature)
            };
        } else { // Adding
            newFeatures = [...features, { ...currentFeature, id: Date.now().toString() }];
            historyEntry = {
                timestamp: new Date(), actionType: 'Added' as const, field: 'features',
                newValue: JSON.stringify(currentFeature)
            };
        }

        updateProject(project.id!, { features: newFeatures }, historyEntry);

        setEditingIndex(null);
        setIsAdding(false);
        setCurrentFeature({ name: '', type: 'New Feature', status: 'Planned', description: '' });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setCurrentFeature(features[index]);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setIsAdding(false);
        setCurrentFeature({ name: '', type: 'New Feature', status: 'Planned', description: '' });
    };

    const handleDelete = (index: number) => {
        if (window.confirm('Are you sure you want to delete this feature?')) {
            const featureToRemove = features[index];
            const newFeatures = features.filter((_, i) => i !== index);
            const historyEntry = {
                timestamp: new Date(), actionType: 'Deleted' as const, field: 'features',
                oldValue: JSON.stringify(featureToRemove)
            };
            updateProject(project.id!, { features: newFeatures }, historyEntry);
        }
    };

    const inputClasses = "w-full p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500";

    const renderFeatureForm = (isEdit: boolean) => (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-2 space-y-3">
            <input
                type="text"
                placeholder="Feature Name"
                value={currentFeature.name}
                onChange={e => setCurrentFeature({ ...currentFeature, name: e.target.value })}
                className={inputClasses}
            />
            <div className="grid grid-cols-2 gap-4">
                <select value={currentFeature.type} onChange={e => setCurrentFeature({ ...currentFeature, type: e.target.value as ProjectFeature['type'] })} className={inputClasses}>
                    {['New Feature', 'Enhancement', 'Bug', 'Backlog'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={currentFeature.status} onChange={e => setCurrentFeature({ ...currentFeature, status: e.target.value as ProjectFeature['status'] })} className={inputClasses}>
                    {['Planned', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <textarea
                placeholder="Description"
                value={currentFeature.description}
                onChange={e => setCurrentFeature({ ...currentFeature, description: e.target.value })}
                className={inputClasses}
            />
            <div className="flex justify-end space-x-2">
                <button onClick={handleCancel} className="px-3 py-1 bg-gray-500 text-white rounded-md flex items-center space-x-1"><XMarkIcon className="h-4 w-4" /><span>Cancel</span></button>
                <button onClick={() => handleSave(isEdit ? editingIndex! : undefined)} className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center space-x-1"><CheckIcon className="h-4 w-4" /><span>Save</span></button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                 <button onClick={() => setIsAdding(true)} className="flex items-center space-x-1 px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Feature</span>
                </button>
                <div className="relative w-full md:w-1/3">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search features..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            {isAdding && renderFeatureForm(false)}

            <div className="space-y-4">
                {filteredFeatures.map((feature, index) => (
                    editingIndex === index ? renderFeatureForm(true) : (
                        <div key={feature.id || index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{feature.name}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-semibold bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full">{feature.type}</span>
                                        <span className="text-xs font-semibold bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200 px-2 py-0.5 rounded-full">{feature.status}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{feature.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(index)} className="text-gray-500 hover:text-gray-700"><PencilIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>
                    )
                ))}
                 {filteredFeatures.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No features match your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturesTab;