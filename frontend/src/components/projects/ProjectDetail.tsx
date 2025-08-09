import React, { useState } from 'react';
import type { Project } from '../../types';
import OverviewTab from './tabs/OverviewTab';
import FeaturesTab from './tabs/FeaturesTab';
import ResourcesTab from './tabs/ResourceTab';
import HistoryTab from './tabs/HistoryTab';

interface ProjectDetailProps {
    project: Project | null;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!project) {
        return <div className="p-8 text-gray-400">Select a project from the list or create a new one.</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'features':
                return <FeaturesTab project={project} />;
            case 'resources':
                return <ResourcesTab project={project} />;
            case 'history':
                return <HistoryTab project={project} />;
            case 'overview':
            default:
                return <OverviewTab project={project} />;
        }
    };

    const tabs = ['overview', 'features', 'resources', 'history'];

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ProjectDetail;