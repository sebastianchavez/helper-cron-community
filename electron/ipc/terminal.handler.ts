import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TerminalResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode?: number;
}

export function registerTerminalHandler() {
  // Ejecutar comando simple
  ipcMain.handle('terminal:execute', async (event, command: string): Promise<TerminalResult> => {
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
      
    } catch (error: any) {
      console.error('[TERMINAL] Command failed:', error);
      
      let errorMessage = error.message || 'Error desconocido';
      if (error.stdout) {
        errorMessage = error.stdout + (error.stderr ? `\n${error.stderr}` : '');
      } else if (error.stderr) {
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
function isCommandSafe(command: string): boolean {
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
  const isAllowed = allowedCommands.some(allowed => 
    commandStart === allowed || commandStart.startsWith(allowed)
  );
  
  if (!isAllowed) {
    console.warn('[TERMINAL] Blocked non-whitelisted command:', command);
    return false;
  }
  
  return true;
}