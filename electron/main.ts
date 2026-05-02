import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import { registerJobHandlers } from './ipc/job.handlers';
import { registerFileDiffHandler } from './ipc/file-diff.handler';
import { registerOllamaChatHandler } from './ipc/ollama-chat.handler';
import { registerOllamaServiceHandler } from './ipc/ollama-service.handler';
import { initDb } from './db/db';
import { registerChatDbHandler } from './ipc/chat-db.handler';
import { registerFolderHandlers } from './ipc/folder.handler';
import { setupUserProfileHandlers } from './ipc/user-profile.handler';
import { registerTerminalHandler } from './ipc/terminal.handler';
import { registerExternalLinkHandler } from './ipc/external-link.handler';
import { registerWindowHandlers } from './ipc/window.handler';
import { registerDirectoryHandler } from './ipc/directory.handler';
import { registerFileWriteHandler } from './ipc/file-write.handler';
import { registerFolderDialogHandler } from './ipc/folder-dialog.handler';
import { registerFlowHandlers } from './ipc/flow.handler';
import { registerExecutionLogHandlers } from './ipc/execution-log.handler';

import { startFlowScheduler, stopFlowScheduler } from './scheduler/flow.scheduler';
import { setMainWindow } from './window-manager';

// Set app name for Windows notifications
app.setName('Helper Cron');
if (process.platform === 'win32') {
    app.setAppUserModelId('Helper Cron');
}

let win: BrowserWindow | null = null;
let ollamaStartedByApp = false;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "HelperCron",
        icon: path.join(__dirname, '../assets/favicon.ico'),
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    const devUrl = process.env['ELECTRON_DEV_URL'];
    if (devUrl) {
        win.loadURL(devUrl);
        win.webContents.openDevTools({ mode: 'detach' });
    } else {
        // PROD: carga dist angular
        win.loadURL(
            path.join(__dirname, '../dist/electron-chatbot-ia-app/browser/index.html')
        );
    }
    win.setMenu(null);
    setMainWindow(win);

    registerJobHandlers(win);
    registerFileDiffHandler();
    registerOllamaChatHandler();
    registerChatDbHandler();
    registerFolderHandlers();
    registerOllamaServiceHandler();
    registerTerminalHandler();
    registerDirectoryHandler();
    registerFileWriteHandler();
    registerFolderDialogHandler();
    registerFlowHandlers();
    registerExecutionLogHandlers();
}

app.whenReady().then(async () => {
    initDb();
    
    // Registrar handlers IPC globales
    setupUserProfileHandlers();
    registerExternalLinkHandler();
    registerWindowHandlers();
    
    // Función para establecer el estado de Ollama iniciado por la aplicación
    global.setOllamaStartedByApp = (started: boolean) => {
        ollamaStartedByApp = started;
        console.log(`[MAIN] Ollama started by app status set to: ${started}`);
    };
    
    // Verificar al inicio si Ollama ya está ejecutándose
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            console.log('[MAIN] Ollama is already running, not started by this app');
            ollamaStartedByApp = false;
        }
    } catch (error) {
        // Ollama no está ejecutándose, lo cual es normal
        console.log('[MAIN] Ollama is not running at startup');
        ollamaStartedByApp = false;
    }
    
    createWindow();
    startFlowScheduler();
});

app.on('window-all-closed', async () => {
    stopFlowScheduler();
    // Detener Ollama solo si fue iniciado por la aplicación
    if (ollamaStartedByApp) {
        console.log('[MAIN] Stopping Ollama (started by app) before closing app...');
        try {
            // En Windows, detener ollama.exe
            if (process.platform === 'win32') {
                await new Promise<void>((resolve) => {
                    exec('taskkill /F /IM ollama.exe 2>nul', (error) => {
                        // Ignorar errores si el proceso no está ejecutándose
                        console.log('[MAIN] Ollama stop command executed');
                        resolve();
                    });
                });
            } else {
                // En Unix/Linux/Mac
                await new Promise<void>((resolve) => {
                    exec('pkill -f ollama', (error) => {
                        console.log('[MAIN] Ollama stop command executed');
                        resolve();
                    });
                });
            }
        } catch (error) {
            console.error('[MAIN] Error stopping Ollama:', error);
        }
    } else {
        console.log('[MAIN] Ollama was not started by this app, skipping cleanup');
    }
    
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async (_event) => {
    stopFlowScheduler();
    if (ollamaStartedByApp) {
        console.log('[MAIN] App is about to quit, ensuring Ollama (started by app) is stopped...');
        // Detener Ollama antes de salir completamente
        try {
            if (process.platform === 'win32') {
                exec('taskkill /F /IM ollama.exe 2>nul', () => {});
            } else {
                exec('pkill -f ollama', () => {});
            }
        } catch (error) {
            console.error('[MAIN] Error in before-quit Ollama cleanup:', error);
        }
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
