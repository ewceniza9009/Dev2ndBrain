import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/useProjectStore';
import { useNoteStore } from '../stores/useNoteStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import ProjectList from '../components/projects/ProjectList';
import ProjectDetail from '../components/projects/ProjectDetail';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import type { Project } from '../types';

const ProjectsPage: React.FC = () => {
    const { projects, fetchProjects, addProject, deleteProject } = useProjectStore();
    const { fetchNotes } = useNoteStore();
    const { fetchSnippets } = useSnippetStore();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [filterTerm, setFilterTerm] = useState('');

    useEffect(() => {
        fetchProjects();
        fetchNotes();
        fetchSnippets();
    }, [fetchProjects, fetchNotes, fetchSnippets]);

    useEffect(() => {
        const stateId = location.state?.selectedId;
        if (stateId) {
            setSelectedProjectId(stateId);
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (!projects || projects.length === 0) return;
        const selectionIsValid = selectedProjectId && projects.some(p => p.id === selectedProjectId);
        if (!selectionIsValid) {
            const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedProjectId(sortedProjects[0]?.id || null);
        }
    }, [projects, selectedProjectId]);

    const filteredProjects = useMemo(() => {
        if (!filterTerm) return projects;
        const lowercasedFilter = filterTerm.toLowerCase();
        return projects.filter(project => 
            project.title.toLowerCase().includes(lowercasedFilter) ||
            project.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [projects, filterTerm]);

    const handleNewProject = async () => {
        const newProject = await addProject({
            title: 'New Project',
            description: '',
            goals: [],
            nextSteps: [],
            features: [],
            resources: [],
            history: [],
        });
        if (newProject?.id) {
            setSelectedProjectId(newProject.id);
        }
    };

    const handleDeleteProject = () => {
        if (selectedProject) {
            setIsConfirmModalOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (selectedProjectId) {
            deleteProject(selectedProjectId);
            setIsConfirmModalOpen(false);
            const remainingProjects = projects.filter(p => p.id !== selectedProjectId);
            setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id! : null);
        }
    };

    const selectedProject = projects.find((p: Project) => p.id === selectedProjectId) || null;

    const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setFilterTerm((e.target as HTMLInputElement).value);
        }
    };

    return (
        <>
            <div className="flex h-full">
                <div className="w-1/4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Projects</h2>
                            <button
                                onClick={handleNewProject}
                                className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>New</span>
                            </button>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Filter projects and press Enter..."
                                onKeyDown={handleFilterKeyDown}
                                className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <ProjectList
                        projects={filteredProjects}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={setSelectedProjectId}
                    />
                </div>
                <div className="w-3/4 h-full flex flex-col overflow-y-auto">
                    {selectedProject && (
                        <div className="flex-shrink-0 p-6 pb-0 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {selectedProject.title}
                            </h2>
                            <button
                                onClick={handleDeleteProject}
                                className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md"
                            >
                                <TrashIcon className="h-5 w-5" />
                                <span>Delete Project</span>
                            </button>
                        </div>
                    )}
                    <ProjectDetail project={selectedProject} />
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Project Deletion"
                message={`Are you sure you want to delete the project "${selectedProject?.title}"? This action cannot be undone.`}
            />
        </>
    );
};

export default ProjectsPage;