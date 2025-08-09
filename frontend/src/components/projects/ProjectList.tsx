import React from 'react';
import type { Project } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { FolderOpenIcon } from '@heroicons/react/20/solid';

interface ProjectListProps {
    projects: Project[];
    selectedProjectId: number | null;
    onSelectProject: (id: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, selectedProjectId, onSelectProject }) => {
    const { openTab } = useAppStore();

    return (
        <div className="bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
            <ul className="flex-grow overflow-y-auto">
                {projects.map((project) => (
                    <li key={project.id}>
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
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectList;