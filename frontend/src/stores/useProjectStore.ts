import { create } from 'zustand';
import { db } from '../services/db';
import { searchService } from '../services/searchService';
import type { Project, HistoryEntry } from '../types';

// Helper to create a history entry
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

// Helper function to safely parse array-like properties from the database
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
    projects: Project[];
    isLoading: boolean;
    fetchProjects: () => Promise<void>;
    addProject: (newProjectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project | undefined>;
    updateProject: (id: number, updatedContent: Partial<Project>, historyEntry?: HistoryEntry) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    deleteHistoryEntry: (projectId: number, entryTimestamp: Date) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: true,

    fetchProjects: async () => {
        set({ isLoading: true });
        const rawProjects = await db.projects.filter(p => !p.isDeleted).toArray();
        // VITAL FIX: Sanitize the data as it comes from the DB
        const sanitizedProjects = rawProjects.map(p => ({
            ...p,
            goals: ensureArray(p.goals),
            nextSteps: ensureArray(p.nextSteps),
            features: ensureArray(p.features),
            resources: ensureArray(p.resources),
            history: ensureArray(p.history),
        }));
        set({ projects: sanitizedProjects, isLoading: false });
    },

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

        set((state) => ({ projects: [...state.projects, createdProject] }));
        searchService.add(createdProject, 'project');
        return createdProject;
    },

    updateProject: async (id, updatedContent, historyEntry) => {
        const now = new Date();
        const projectToUpdate = get().projects.find(p => p.id === id);
        if (!projectToUpdate) return;

        const newHistory = historyEntry
            ? [...projectToUpdate.history, historyEntry]
            : updatedContent.history || projectToUpdate.history;


        const payload = { ...updatedContent, history: newHistory, updatedAt: now };
        await db.projects.update(id, payload);
        const updatedProject = { ...projectToUpdate, ...payload };

        set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        }));
        searchService.add(updatedProject, 'project');
    },

    deleteProject: async (id) => {
        await db.projects.update(id, { isDeleted: true, updatedAt: new Date() });
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
        }));
        searchService.remove(id, 'project');
    },

    deleteHistoryEntry: async (projectId: number, entryTimestamp: Date) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return;
        const newHistory = project.history.filter(h => new Date(h.timestamp).getTime() !== entryTimestamp.getTime());
        await get().updateProject(projectId, { history: newHistory });
    },
}));