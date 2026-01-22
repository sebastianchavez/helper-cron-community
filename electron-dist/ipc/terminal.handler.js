"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTerminalHandler = registerTerminalHandler;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function registerTerminalHandler() {
    // Ejecutar comando simple
    electron_1.ipcMain.handle('terminal:execute', async (event, command) => {
        try {
            console.log('[TERMINAL] Executing command:', command);
            // Validación básica de seguridad
            if (!isCommandSafe(command)) {
                return {
                    success: false,
                    error: 'Comando no permitido por seguridad'
                };
            }
            const { stdout, stderr } = await execAsync(command, {
                timeout: 30000, // 30 segundos timeout
                maxBuffer: 1024 * 1024, // 1MB buffer máximo
                env: { ...process.env }
            });
            let output = stdout;
            if (stderr) {
                output += stderr ? `\n${stderr}` : '';
            }
            console.log('[TERMINAL] Command completed successfully');
            return {
                success: true,
                output: output.trim()
            };
        }
        catch (error) {
            console.error('[TERMINAL] Command failed:', error);
            let errorMessage = error.message || 'Error desconocido';
            if (error.stdout) {
                errorMessage = error.stdout + (error.stderr ? `\n${error.stderr}` : '');
            }
            else if (error.stderr) {
                errorMessage = error.stderr;
            }
            return {
                success: false,
                error: errorMessage.trim(),
                exitCode: error.code
            };
        }
    });
}
// Validación básica de seguridad para comandos
function isCommandSafe(command) {
    const trimmed = command.trim().toLowerCase();
    // Lista de comandos prohibidos (expandir según necesidades)
    const forbiddenCommands = [
        'rm -rf',
        'del /f',
        'format',
        'shutdown',
        'reboot',
        'sudo rm',
        'chmod 777',
        '> /dev/null',
        'dd if=',
        'mkfs',
        'fdisk',
        'passwd',
        'su -',
        'chmod +x'
    ];
    // Comandos permitidos para Ollama y diagnóstico básico
    const allowedCommands = [
        'ollama',
        'echo',
        'dir',
        'ls',
        'pwd',
        'cd',
        'cat',
        'type',
        'where',
        'which',
        'whoami',
        'date',
        'time',
        'hostname',
        'ipconfig',
        'ifconfig',
        'ping',
        'curl',
        'wget',
        'ps',
        'tasklist',
        'taskkill',
        'netstat',
        'systemctl status',
        'service',
        'brew'
    ];
    // Verificar comandos prohibidos
    for (const forbidden of forbiddenCommands) {
        if (trimmed.includes(forbidden)) {
            console.warn('[TERMINAL] Blocked forbidden command:', command);
            return false;
        }
    }
    // Verificar que comience con un comando permitido
    const commandStart = trimmed.split(' ')[0];
    const isAllowed = allowedCommands.some(allowed => commandStart === allowed || commandStart.startsWith(allowed));
    if (!isAllowed) {
        console.warn('[TERMINAL] Blocked non-whitelisted command:', command);
        return false;
    }
    return true;
}
