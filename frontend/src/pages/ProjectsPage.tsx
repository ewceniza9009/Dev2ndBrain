import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/useProjectStore';
import ProjectList from '../components/projects/ProjectList';
import ProjectDetail from '../components/projects/ProjectDetail';
import type { Project } from '../types';
import { PlusIcon } from '@heroicons/react/20/solid';

const ProjectsPage: React.FC = () => {
    const { projects, fetchProjects, addProject } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (location.state?.selectedId) {
            setSelectedProjectId(location.state.selectedId);
            navigate(location.pathname, { replace: true });
        } else if (!selectedProjectId && projects.length > 0) {
            const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedProjectId(sortedProjects[0].id!);
        }
    }, [projects, selectedProjectId, location.state, navigate]);

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

    const selectedProject = projects.find((p: Project) => p.id === selectedProjectId) || null;

    return (
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
            <div className="w-3/4 h-full overflow-y-auto">
                <ProjectDetail project={selectedProject} />
            </div>
        </div>
    );
};

export default ProjectsPage;