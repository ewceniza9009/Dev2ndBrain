import { useAuthStore } from "../stores/useAuthStore";
import type { Snippet } from "../types";

const API_BASE_URL = 'http://localhost:7150';

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
            },
            body: JSON.stringify({
                accessToken: token,
                description: snippet.title,
                filename: `${snippet.title.replace(/\s+/g, '-')}.${snippet.language}`, // e.g., My-Snippet.js
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
    }
};