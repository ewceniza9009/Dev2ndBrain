// electron/src/main.cts

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { URL } from 'url';
import http from 'http';
import config from './config.cjs'; // <-- This correctly imports your keys

const APP_URL = "https://localhost:7150";
const IS_DEV = !app.isPackaged;
let backendProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

function spawnBackend(): Promise<void> {
    return new Promise((resolve, reject) => {
        let hasStarted = false;
        const backendPath = path.join(__dirname, '..', '..', 'backend');
        const command = 'dotnet';
        const args = ['run', '--project', backendPath];
        const env = { ...process.env, 'IsSelfHosted': 'true' };
        backendProcess = spawn(command, args, { stdio: 'pipe', env: env });
        backendProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            console.log(`[ASPNET_CORE]: ${output}`);
            if (output.includes('Now listening on:')) { hasStarted = true; resolve(); }
        });
        backendProcess.on('close', (code) => { if (!hasStarted) reject(new Error(`Backend process exited prematurely`)); });
        backendProcess.stderr?.on('data', (data) => { console.error(`[ASPNET_CORE_ERROR]: ${data}`); });
    });
}

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });
    mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
        if (new URL(url).hostname === 'localhost') { event.preventDefault(); callback(true); } else { callback(false); }
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
    mainWindow.loadURL(APP_URL);
    if (IS_DEV) mainWindow.webContents.openDevTools();
}

ipcMain.on('github-oauth', (event) => {
    // Read the keys from the imported config object
    const clientId = config.CLIENT_ID;
    const scope = config.GIST_SCOPE;

    // This check now correctly validates the config file
    if (!clientId || !scope || clientId === "your_github_client_id_goes_here") {
        event.sender.send('github-oauth-failure', 'Client ID is not configured in electron/src/config.cjs');
        return;
    }

    const redirectUri = 'http://localhost:5174/oauth/callback';
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // This line opens the URL in your default browser
    shell.openExternal(githubOAuthUrl);

    // The rest of the function remains the same...
    const server = http.createServer((req, res) => {
        const reqUrl = new URL(req.url!, 'http://localhost:5174');
        if (reqUrl.pathname === '/oauth/callback') {
            const code = reqUrl.searchParams.get('code');
            if (code) {
                if (mainWindow) { mainWindow.webContents.send('github-oauth-success', code); }
            } else {
                if (mainWindow) { mainWindow.webContents.send('github-oauth-failure', 'Authentication failed: No code received.'); }
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Login successful! You can now close this tab.</h1><script>window.close();</script>');
            server.close();
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    server.listen(5174, 'localhost', () => { console.log('Temporary OAuth server started on port 5174'); });
    app.once('before-quit', () => { server.close(); });
});

app.whenReady().then(async () => {
    try {
        await spawnBackend();
        createWindow();
    } catch (error) {
        console.error("Failed to start application:", error);
        app.quit();
    }
});

app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});