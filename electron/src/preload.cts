// electron/preload.cts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    githubOAuthLogin: () => ipcRenderer.send('github-oauth'),
    onOAuthSuccess: (callback: (code: string) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, code: string) => callback(code);
        ipcRenderer.on('github-oauth-success', listener);
        return () => ipcRenderer.removeListener('github-oauth-success', listener);
    },
    onOAuthFailure: (callback: (error: string) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
        ipcRenderer.on('github-oauth-failure', listener);
        return () => ipcRenderer.removeListener('github-oauth-failure', listener);
    },
    offOAuthSuccess: (callback: (code: string) => void) => {
        ipcRenderer.removeListener('github-oauth-success', (_event, code) => callback(code));
    },
    offOAuthFailure: (callback: (error: string) => void) => {
        ipcRenderer.removeListener('github-oauth-failure', (_event, error) => callback(error));
    },
});