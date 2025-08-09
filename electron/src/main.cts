import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'; // <-- MODIFIED: Added Menu
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { URL } from 'url';
import http from 'http';
import config from './config.cjs';
import log from 'electron-log';

// --- Configure the Logger ---
log.transports.file.level = 'info';
log.info('App starting...');

const APP_URL = "https://localhost:7150";
const IS_DEV = !app.isPackaged;
let backendProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

function spawnBackend(): Promise<void> {
    return new Promise((resolve, reject) => {
        log.info('Attempting to spawn backend...');
        let hasStarted = false;
        
        const backendExecutableName = process.platform === 'win32' ? 'backend.exe' : 'backend';
        
        const env = { ...process.env, 'IsSelfHosted': 'true' };

        let backendPath;
        if (app.isPackaged) {
            backendPath = path.join(process.resourcesPath, 'backend', backendExecutableName);
        } else {
            const projectDir = path.join(__dirname, '..', '..', 'backend');
            backendPath = `dotnet`;
            const args = ['run', '--project', projectDir];
            backendProcess = spawn(backendPath, args, { stdio: 'pipe', env: env }); 
        }

        if (app.isPackaged) {
            const backendDir = path.dirname(backendPath);
            log.info(`Packaged mode: Spawning '${backendPath}' with CWD '${backendDir}'`);
            backendProcess = spawn(backendPath, [], { 
                stdio: 'pipe',
                cwd: backendDir,
                env: env
            });
        }

        if (!backendProcess) {
            return reject(new Error("Backend process could not be started."));
        }

        backendProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            log.info(`[BACKEND_STDOUT]: ${output}`);
            if (output.includes('Now listening on:')) {
                if (!hasStarted) {
                    hasStarted = true;
                    log.info('Backend has started successfully.');
                    resolve();
                }
            }
        });

        backendProcess.stderr?.on('data', (data) => {
            log.error(`[BACKEND_STDERR]: ${data}`);
        });

        backendProcess.on('close', (code) => {
            log.warn(`Backend process exited with code ${code}`);
            if (!hasStarted) {
                reject(new Error(`Backend process exited prematurely with code ${code}`));
            }
        });

        backendProcess.on('error', (err) => {
            log.error('Failed to start backend process:', err);
            reject(err);
        });
    });
}

function createWindow(): void {
    log.info('Creating main browser window...');
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    mainWindow.maximize();
    mainWindow.show();

    mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
        if (new URL(url).hostname === 'localhost') { event.preventDefault(); callback(true); } else { callback(false); }
    });

    //mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

    // --- Update the window open handler ---
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // If the URL is 'about:blank', it's our code runner. Allow it.
        if (url === 'about:blank') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: { // Optional: configure the popup window
                    autoHideMenuBar: true,
                }
            };
        }
        // For all other URLs, open them in the user's default browser.
        shell.openExternal(url);
        return { action: 'deny' };
    });

    log.info(`Loading URL: ${APP_URL}`);
    mainWindow.loadURL(APP_URL);
    if (IS_DEV) mainWindow.webContents.openDevTools();
}

function createHelpWindow() {
    log.info('Creating help window...');
    const helpWindow = new BrowserWindow({
        width: 800,
        height: 700,
        title: 'Dev2ndBrain Help',
    });
    // `__dirname` points to the `build` folder, so `help.html` in the parent is correct
    helpWindow.loadFile(path.join(__dirname, '..', 'help.html'));
    helpWindow.setMenu(null);
}

ipcMain.on('github-oauth', (event) => {
    const clientId = config.CLIENT_ID;
    const scope = config.GIST_SCOPE;

    if (!clientId || !scope || clientId === "your_github_client_id_goes_here") {
        event.sender.send('github-oauth-failure', 'Client ID is not configured in electron/src/config.cjs');
        return;
    }

    const redirectUri = 'http://localhost:5174/oauth/callback';
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    shell.openExternal(githubOAuthUrl);

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
    server.listen(5174, 'localhost', () => { log.info('Temporary OAuth server started on port 5174'); });
    app.once('before-quit', () => { server.close(); });
});

// --- Main App Logic with Error Catching ---
try {
    app.whenReady().then(async () => {
        log.info('App is ready.');
        
        // <-- Create and set the application menu -->
        const menuTemplate: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
            { role: 'fileMenu' },
            { role: 'editMenu' },
            { role: 'viewMenu' },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'View Help',
                        click: () => {
                            createHelpWindow();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Learn More on GitHub',
                        click: async () => {
                            await shell.openExternal('https://github.com/ewceniza9009/Dev2ndBrain');
                        }
                    }
                ]
            }
        ];
        
        if (process.platform === 'darwin') {
            menuTemplate.unshift({ role: 'appMenu' });
        }

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);

        try {
            await spawnBackend();
            createWindow();
        } catch (error) {
            log.error("Failed to start application:", error);
            app.quit();
        }
    });

    app.on('will-quit', () => {
        log.info('App will quit.');
        if (backendProcess) backendProcess.kill();
    });

    app.on('window-all-closed', () => {
        log.info('All windows closed.');
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            log.info('App activated, creating window.');
            createWindow();
        }
    });
} catch (e) {
    log.error('A critical error occurred on startup:', e);
    app.quit();
}