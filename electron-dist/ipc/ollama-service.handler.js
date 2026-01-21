"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOllamaServiceHandler = registerOllamaServiceHandler;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Verificar si Ollama está instalado
async function isOllamaInstalled() {
    try {
        // Intentar ejecutar 'ollama --version' para verificar si está instalado
        if (process.platform === 'win32') {
            await execAsync('ollama.exe --version');
        }
        else {
            await execAsync('ollama --version');
        }
        return true;
    }
    catch (error) {
        console.log('Ollama not found in PATH:', error?.message || error);
        // Verificar en ubicaciones comunes de Windows
        if (process.platform === 'win32') {
            const commonPaths = [
                'C:\\Users\\%USERNAME%\\AppData\\Local\\Ollama\\ollama.exe',
                'C:\\Program Files\\Ollama\\ollama.exe',
                'C:\\Program Files (x86)\\Ollama\\ollama.exe'
            ];
            for (const path of commonPaths) {
                try {
                    const expandedPath = path.replace('%USERNAME%', process.env.USERNAME || '');
                    await execAsync(`"${expandedPath}" --version`);
                    return true;
                }
                catch (err) {
                    // Continue checking other paths
                }
            }
        }
        return false;
    }
}
// Verificar si Ollama está ejecutándose
async function isOllamaRunning() {
    try {
        // Intentar hacer una petición simple a Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        return response.ok;
    }
    catch (error) {
        console.log('Ollama service not responding:', error?.message || error);
        return false;
    }
}
// Obtener el comando correcto de Ollama según la plataforma
function getOllamaCommand() {
    if (process.platform === 'win32') {
        // Intentar diferentes ubicaciones en Windows
        const possiblePaths = [
            'ollama.exe',
            'C:\\Users\\%USERNAME%\\AppData\\Local\\Ollama\\ollama.exe',
            'C:\\Program Files\\Ollama\\ollama.exe',
            'C:\\Program Files (x86)\\Ollama\\ollama.exe'
        ];
        for (const path of possiblePaths) {
            try {
                const expandedPath = path.replace('%USERNAME%', process.env.USERNAME || '');
                (0, child_process_1.execSync)(`"${expandedPath}" --version`, { stdio: 'ignore' });
                return expandedPath;
            }
            catch (error) {
                continue;
            }
        }
    }
    return 'ollama';
}
// Iniciar Ollama
async function startOllama() {
    try {
        const ollamaCommand = getOllamaCommand();
        // Iniciar Ollama como servicio en segundo plano
        if (process.platform === 'win32') {
            // En Windows, usar 'start' para abrir en una nueva ventana
            (0, child_process_1.spawn)('cmd', ['/c', 'start', '/min', ollamaCommand, 'serve'], {
                detached: true,
                stdio: 'ignore'
            });
        }
        else {
            // En Unix/Linux/Mac
            (0, child_process_1.spawn)(ollamaCommand, ['serve'], {
                detached: true,
                stdio: 'ignore'
            });
        }
        // Esperar un momento para que el servicio se inicie
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Verificar si se inició correctamente
        const running = await isOllamaRunning();
        if (running) {
            return { success: true };
        }
        else {
            return { success: false, error: 'El servicio se inició pero no responde' };
        }
    }
    catch (error) {
        console.error('Error starting Ollama:', error);
        return { success: false, error: error?.message || 'Error desconocido' };
    }
}
// Verificar el estado completo de Ollama
async function checkOllamaStatus() {
    try {
        const installed = await isOllamaInstalled();
        if (!installed) {
            return { installed: false, running: false };
        }
        const running = await isOllamaRunning();
        return { installed: true, running };
    }
    catch (error) {
        return {
            installed: false,
            running: false,
            error: error?.message || 'Error desconocido'
        };
    }
}
function registerOllamaServiceHandler() {
    // Verificar estado de Ollama
    electron_1.ipcMain.handle('ollama:check-status', async () => {
        console.log('[OLLAMA] Checking Ollama status...');
        const status = await checkOllamaStatus();
        console.log('[OLLAMA] Status:', status);
        return status;
    });
    // Iniciar servicio de Ollama
    electron_1.ipcMain.handle('ollama:start-service', async () => {
        console.log('[OLLAMA] Starting Ollama service...');
        const result = await startOllama();
        console.log('[OLLAMA] Start result:', result);
        return result;
    });
    // Verificar si Ollama está instalado
    electron_1.ipcMain.handle('ollama:is-installed', async () => {
        console.log('[OLLAMA] Checking if Ollama is installed...');
        const installed = await isOllamaInstalled();
        console.log('[OLLAMA] Installed:', installed);
        return installed;
    });
}
