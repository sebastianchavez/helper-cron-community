import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { registerJobHandlers } from './ipc/job.handlers';
import { registerFileDiffHandler } from './ipc/file-diff.handler';
import { registerOllamaChatHandler } from './ipc/ollama-chat.handler';
import { registerOllamaPlanHandler } from './ipc/ollama-plan.handler';
import { registerOllamaServiceHandler } from './ipc/ollama-service.handler';
import { initDb } from './db/db';
import { registerChatDbHandler } from './ipc/chat-db.handler';
import { registerFolderHandlers } from './ipc/folder.handler';
import { setupUserProfileHandlers } from './ipc/user-profile.handler';
import { registerExternalLinkHandler } from './ipc/external-link.handler';


let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "LocalMind",
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
    registerExternalLinkHandler();
}

app.whenReady().then(() => {
    initDb();
    
    // Registrar handlers IPC
    setupUserProfileHandlers();
    registerExternalLinkHandler();
    
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
