import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import { registerJobHandlers } from './ipc/job.handlers';
import { registerFileDiffHandler } from './ipc/file-diff.handler';
import { registerOllamaChatHandler } from './ipc/ollama-chat.handler';
import { registerOllamaPlanHandler } from './ipc/ollama-plan.handler';
import { registerOllamaServiceHandler } from './ipc/ollama-service.handler';
import { initDb } from './db/db';
import { registerChatDbHandler } from './ipc/chat-db.handler';
import { registerFolderHandlers } from './ipc/folder.handler';
import { setupUserProfileHandlers } from './ipc/user-profile.handler';
import { registerTerminalHandler } from './ipc/terminal.handler';
import { registerExternalLinkHandler } from './ipc/external-link.handler';


let win: BrowserWindow | null = null;

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

    
    registerJobHandlers(win);
    registerFileDiffHandler();
    registerOllamaChatHandler();
    registerChatDbHandler();
    registerFolderHandlers();
    registerOllamaPlanHandler();
    registerOllamaServiceHandler();
    registerTerminalHandler();
}

app.whenReady().then(() => {
    initDb();
    
    // Registrar handlers IPC globales
    setupUserProfileHandlers();
    registerExternalLinkHandler();
    
    createWindow();
});

app.on('window-all-closed', async () => {
    // Detener Ollama antes de cerrar la aplicación
    console.log('[MAIN] Stopping Ollama before closing app...');
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
    
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async (event) => {
    console.log('[MAIN] App is about to quit, ensuring Ollama is stopped...');
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
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
