import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import type { Project, HistoryEntry } from '../../../types';
import { TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

const ensureArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    }
    return [];
};

const HistoryTab: React.FC<{ project: Project }> = ({ project }) => {
    const { deleteHistoryEntry } = useProjectStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const history = useMemo(() => ensureArray(project.history), [project.history]);

    const filteredHistory = useMemo(() => {
        const reversedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return reversedHistory.filter(entry => {
            const filterMatch = activeFilter === 'all' || entry.field.toLowerCase() === activeFilter;
            
            const searchMatch = !searchTerm ||
                entry.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (entry.oldValue && entry.oldValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (entry.newValue && entry.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

            return filterMatch && searchMatch;
        });
    }, [history, searchTerm, activeFilter]);

    const handleDelete = (timestamp: Date) => {
        if (window.confirm("Are you sure you want to delete this history entry? This cannot be undone.")) {
            const dateTimestamp = new Date(timestamp);
            deleteHistoryEntry(project.id!, dateTimestamp);
        }
    };
    
    const getActionBadgeColor = (action: HistoryEntry['actionType']) => {
        switch (action) {
            case 'Added': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Updated': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    
    const filters = ['all', 'goals', 'nextSteps', 'features', 'resources'];

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                 <div className="relative w-full md:w-1/3">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter by:</span>
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                'px-3 py-1 text-sm font-semibold rounded-full capitalize',
                                activeFilter === filter
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* History List */}
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {filteredHistory.map((entry, entryIdx) => (
                        <li key={entry.timestamp.toString() + entryIdx}>
                            <div className="relative pb-8">
                                {entryIdx !== filteredHistory.length - 1 && (
                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                )}
                                <div className="relative flex items-start space-x-3">
                                    <div className="relative">
                                        <div className={clsx('h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900', getActionBadgeColor(entry.actionType))}>
                                            <span className="font-bold text-xs">{entry.actionType.charAt(0)}</span>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 py-1.5">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className={clsx('font-medium px-2 py-0.5 rounded-md text-xs', getActionBadgeColor(entry.actionType))}>{entry.actionType}</span> on field <span className="font-medium text-gray-900 dark:text-white">{entry.field}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                                            {entry.oldValue && <p><span className="font-semibold">Old:</span> {entry.oldValue}</p>}
                                            {entry.newValue && <p><span className="font-semibold">New:</span> {entry.newValue}</p>}
                                        </div>
                                    </div>
                                     <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 flex items-center pt-1.5">
                                        <time dateTime={new Date(entry.timestamp).toISOString()}>
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </time>
                                        <button onClick={() => handleDelete(entry.timestamp)} className="ml-4 text-red-500 hover:text-red-700">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                 {filteredHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No history entries match your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryTab;