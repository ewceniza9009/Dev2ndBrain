import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import type { Project, HistoryEntry } from '../types';

const createHistoryEntry = (
    action: HistoryEntry['actionType'],
    field: string,
    oldValue?: any,
    newValue?: any
): HistoryEntry => ({
    timestamp: new Date(),
    actionType: action,
    field,
    oldValue: oldValue !== undefined ? JSON.stringify(oldValue) : undefined,
    newValue: newValue !== undefined ? JSON.stringify(newValue) : undefined,
});

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

interface ProjectState {
    addProject: (newProjectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project | undefined>;
    updateProject: (id: number, updatedContent: Partial<Project>, historyEntry?: HistoryEntry) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    deleteHistoryEntry: (projectId: number, entryTimestamp: Date) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((_set, get) => ({
    addProject: async (newProjectData) => {
        const now = new Date();
        const project: Project = {
            ...newProjectData,
            createdAt: now,
            updatedAt: now,
            history: [createHistoryEntry('Added', 'Project', undefined, newProjectData.title)]
        };
        const id = await db.projects.add(project);
        const createdProject = { ...project, id };
        searchService.add(createdProject, 'project');
        return createdProject;
    },

    updateProject: async (id, updatedContent, historyEntry) => {
        const now = new Date();
        const projectToUpdate = await db.projects.get(id);
        if (!projectToUpdate) return;
        
        const currentHistory = ensureArray(projectToUpdate.history);

        const newHistory = historyEntry
            ? [...currentHistory, historyEntry]
            : updatedContent.history || currentHistory;

        const payload = { ...updatedContent, history: newHistory, updatedAt: now };
        await db.projects.update(id, payload);
        const updatedProject = { ...projectToUpdate, ...payload };

        searchService.add(updatedProject, 'project');
    },

    deleteProject: async (id) => {
        await db.projects.update(id, { isDeleted: true, updatedAt: new Date() });
        searchService.remove(id, 'project');
    },

    deleteHistoryEntry: async (projectId: number, entryTimestamp: Date) => {
        const project = await db.projects.get(projectId);
        if (!project) return;
        const currentHistory = ensureArray(project.history);
        const newHistory = currentHistory.filter(h => new Date(h.timestamp).getTime() !== entryTimestamp.getTime());
        await get().updateProject(projectId, { history: newHistory });
    },
}));