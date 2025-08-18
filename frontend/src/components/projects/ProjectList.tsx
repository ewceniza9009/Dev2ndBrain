import React, { useRef } from 'react';
import type { Project } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { FolderOpenIcon } from '@heroicons/react/20/solid';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ProjectListProps {
    projects: Project[];
    selectedProjectId: number | null;
    onSelectProject: (id: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, selectedProjectId, onSelectProject }) => {
    const { openTab } = useAppStore();
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: projects.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 68,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col overflow-y-auto">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const project = projects[virtualItem.index];
                    return (
                        <div
                            key={project.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            <div className="flex items-center justify-between w-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <button
                                    onClick={() => onSelectProject(project.id!)}
                                    className={`flex-grow text-left p-4 border-l-4 ${selectedProjectId === project.id ? 'bg-gray-200 dark:bg-gray-700 border-teal-500' : 'border-transparent'}`}
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                                </button>
                                <button
                                    onClick={() => openTab({ type: 'project', entityId: project.id!, title: project.title })}
                                    className="p-2 mr-2 text-gray-500 hover:text-teal-500"
                                    title="Open in new tab"
                                >
                                    <FolderOpenIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectList;