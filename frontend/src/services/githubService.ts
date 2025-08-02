import { useAuthStore } from "../stores/useAuthStore";
import type { Snippet } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7150';

async function getAuthToken(): Promise<string | null> {
    return useAuthStore.getState().getDecryptedToken();
}

export const githubService = {
    async createGist(snippet: Snippet): Promise<{ gistId: string, gistUrl: string }> {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/gist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Correctly use the header
            },
            body: JSON.stringify({
                // accessToken is now removed from the body
                description: snippet.title,
                filename: `${snippet.title.replace(/\s+/g, '-')}.${snippet.language}`,
                content: snippet.code,
                isPublic: false,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create Gist.");
        }
        return response.json();
    },

    async importGists(): Promise<any[]> {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/gist`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to import Gists.");
        }
        return response.json();
    },

    async getGist(gistId: string): Promise<any> {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/gist/${gistId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch Gist.");
        }
        return response.json();
    },

    async updateGist(snippet: Snippet): Promise<any> {
        const token = await getAuthToken();
        if (!token || !snippet.gistId) throw new Error("User not authenticated or missing Gist ID.");
        
        const response = await fetch(`${API_BASE_URL}/api/gist`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Correctly use the header
            },
            body: JSON.stringify({
                // accessToken is now removed from the body
                gistId: snippet.gistId,
                description: snippet.title,
                filename: `${snippet.title.replace(/\s+/g, '-')}.${snippet.language}`,
                content: snippet.code,
            }),
        });
        
        if (!response.ok) {
            throw new Error("Failed to update Gist.");
        }
        return response.json();
    }
};