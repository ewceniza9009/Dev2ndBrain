import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

interface RecentProjectsProps {
  projects: Project[];
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Recently Edited Projects
      </h2>
      {projects.length > 0 ? (
        <ul className="space-y-3 flex-grow">
          {projects.map(project => (
            <li key={project.id}>
              <Link
                to={`/projects`}
                state={{ selectedId: project.id }}
                className="group flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{project.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Edited: {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRightIcon className="h-6 w-6 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No projects yet. Create your first project workspace!</p>
      )}
    </div>
  );
};

export default RecentProjects;