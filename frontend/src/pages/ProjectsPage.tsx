import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/useProjectStore';
import { useNoteStore } from '../stores/useNoteStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import ProjectList from '../components/projects/ProjectList';
import ProjectDetail from '../components/projects/ProjectDetail';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { Project } from '../types';

const ProjectsPage: React.FC = () => {
    const { projects, fetchProjects, addProject, deleteProject } = useProjectStore();
    const { fetchNotes } = useNoteStore();
    const { fetchSnippets } = useSnippetStore();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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
            // Optionally, select the first project in the list after deletion
            const remainingProjects = projects.filter(p => p.id !== selectedProjectId);
            setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id! : null);
        }
    };

    const selectedProject = projects.find((p: Project) => p.id === selectedProjectId) || null;

    return (
        <>
            <div className="flex h-full">
                <div className="w-1/4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Projects</h2>
                        <button
                            onClick={handleNewProject}
                            className="flex items-center space-x-1 bg-teal-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>New</span>
                        </button>
                    </div>
                    <ProjectList
                        projects={projects}
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
                                className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
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