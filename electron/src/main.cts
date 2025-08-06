import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { URL } from 'url';

const APP_URL = "https://localhost:7150";
const IS_DEV = !app.isPackaged;
let backendProcess: ChildProcess | null = null;

// function spawnBackend(): Promise<void> {
//     return new Promise((resolve, reject) => {
//         let hasStarted = false;
//         const backendPath = path.join(__dirname, '..', '..', 'backend');
//         const command = 'dotnet';
//         const args = ['run', '--project', backendPath];

//         backendProcess = spawn(command, args, { stdio: 'pipe' });

//         backendProcess.stdout?.on('data', (data) => {
//             const output = data.toString();
//             console.log(`[ASPNET_CORE]: ${output}`);
//             if (output.includes('Now listening on:')) {
//                 hasStarted = true;
//                 resolve();
//             }
//         });
//         backendProcess.on('close', (code) => {
//             if (!hasStarted) reject(new Error(`Backend process exited prematurely`));
//         });
//         backendProcess.stderr?.on('data', (data) => {
//             console.error(`[ASPNET_CORE_ERROR]: ${data}`);
//         });
//     });
// }

function spawnBackend(): Promise<void> {
    return new Promise((resolve, reject) => {
        let hasStarted = false;
        const backendPath = path.join(__dirname, '..', '..', 'backend');
        const command = 'dotnet';
        // This is the only argument needed now
        const args = ['run', '--project', backendPath]; 
        
        // This environment variable is the key to making the backend "smart"
        const env = { ...process.env, 'IsSelfHosted': 'true' };

        backendProcess = spawn(command, args, { stdio: 'pipe', env: env });

        backendProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            console.log(`[ASPNET_CORE]: ${output}`);
            if (output.includes('Now listening on:')) {
                hasStarted = true;
                resolve();
            }
        });
        backendProcess.on('close', (code) => {
            if (!hasStarted) reject(new Error(`Backend process exited prematurely`));
        });
        backendProcess.stderr?.on('data', (data) => {
            console.error(`[ASPNET_CORE_ERROR]: ${data}`);
        });
    });
}

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
        if (new URL(url).hostname === 'localhost') {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.loadURL(APP_URL);
    if (IS_DEV) mainWindow.webContents.openDevTools();
}

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