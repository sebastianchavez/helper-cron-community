"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const job_handlers_1 = require("./ipc/job.handlers");
const file_diff_handler_1 = require("./ipc/file-diff.handler");
const ollama_chat_handler_1 = require("./ipc/ollama-chat.handler");
const ollama_plan_handler_1 = require("./ipc/ollama-plan.handler");
const ollama_service_handler_1 = require("./ipc/ollama-service.handler");
const db_1 = require("./db/db");
const chat_db_handler_1 = require("./ipc/chat-db.handler");
const folder_handler_1 = require("./ipc/folder.handler");
const user_profile_handler_1 = require("./ipc/user-profile.handler");
const terminal_handler_1 = require("./ipc/terminal.handler");
const external_link_handler_1 = require("./ipc/external-link.handler");
let win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "HelperCron",
        icon: path_1.default.join(__dirname, '../assets/favicon.ico'),
        resizable: true,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    const devUrl = process.env['ELECTRON_DEV_URL'];
    if (devUrl) {
        win.loadURL(devUrl);
        win.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        // PROD: carga dist angular
        win.loadURL(path_1.default.join(__dirname, '../dist/electron-chatbot-ia-app/browser/index.html'));
    }
    win.setMenu(null);
    (0, job_handlers_1.registerJobHandlers)(win);
    (0, file_diff_handler_1.registerFileDiffHandler)();
    (0, ollama_chat_handler_1.registerOllamaChatHandler)();
    (0, chat_db_handler_1.registerChatDbHandler)();
    (0, folder_handler_1.registerFolderHandlers)();
    (0, ollama_plan_handler_1.registerOllamaPlanHandler)();
    (0, ollama_service_handler_1.registerOllamaServiceHandler)();
    (0, terminal_handler_1.registerTerminalHandler)();
}
electron_1.app.whenReady().then(() => {
    (0, db_1.initDb)();
    // Registrar handlers IPC globales
    (0, user_profile_handler_1.setupUserProfileHandlers)();
    (0, external_link_handler_1.registerExternalLinkHandler)();
    createWindow();
});
electron_1.app.on('window-all-closed', async () => {
    // Detener Ollama antes de cerrar la aplicación
    console.log('[MAIN] Stopping Ollama before closing app...');
    try {
        // En Windows, detener ollama.exe
        if (process.platform === 'win32') {
            await new Promise((resolve) => {
                (0, child_process_1.exec)('taskkill /F /IM ollama.exe 2>nul', (error) => {
                    // Ignorar errores si el proceso no está ejecutándose
                    console.log('[MAIN] Ollama stop command executed');
                    resolve();
                });
            });
        }
        else {
            // En Unix/Linux/Mac
            await new Promise((resolve) => {
                (0, child_process_1.exec)('pkill -f ollama', (error) => {
                    console.log('[MAIN] Ollama stop command executed');
                    resolve();
                });
            });
        }
    }
    catch (error) {
        console.error('[MAIN] Error stopping Ollama:', error);
    }
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('before-quit', async (event) => {
    console.log('[MAIN] App is about to quit, ensuring Ollama is stopped...');
    // Detener Ollama antes de salir completamente
    try {
        if (process.platform === 'win32') {
            (0, child_process_1.exec)('taskkill /F /IM ollama.exe 2>nul', () => { });
        }
        else {
            (0, child_process_1.exec)('pkill -f ollama', () => { });
        }
    }
    catch (error) {
        console.error('[MAIN] Error in before-quit Ollama cleanup:', error);
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
