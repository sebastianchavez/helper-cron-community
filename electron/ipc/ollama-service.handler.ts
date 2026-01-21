import { ipcMain } from 'electron';
import { execSync, spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface OllamaStatus {
  installed: boolean;
  running: boolean;
  error?: string;
}

// Verificar si Ollama está instalado
async function isOllamaInstalled(): Promise<boolean> {
  try {
    // Intentar ejecutar 'ollama --version' para verificar si está instalado
    if (process.platform === 'win32') {
      await execAsync('ollama.exe --version');
    } else {
      await execAsync('ollama --version');
    }
    return true;
  } catch (error: any) {
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
        } catch (err) {
          // Continue checking other paths
        }
      }
    }
    
    return false;
  }
}

// Verificar si Ollama está ejecutándose
async function isOllamaRunning(): Promise<boolean> {
  try {
    // Intentar hacer una petición simple a Ollama
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error: any) {
    console.log('Ollama service not responding:', error?.message || error);
    return false;
  }
}

// Obtener el comando correcto de Ollama según la plataforma
function getOllamaCommand(): string {
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
        execSync(`"${expandedPath}" --version`, { stdio: 'ignore' });
        return expandedPath;
      } catch (error) {
        continue;
      }
    }
  }
  
  return 'ollama';
}

// Iniciar Ollama
async function startOllama(): Promise<{ success: boolean; error?: string }> {
  try {
    const ollamaCommand = getOllamaCommand();
    
    // Iniciar Ollama como servicio en segundo plano
    if (process.platform === 'win32') {
      // En Windows, usar 'start' para abrir en una nueva ventana
      spawn('cmd', ['/c', 'start', '/min', ollamaCommand, 'serve'], {
        detached: true,
        stdio: 'ignore'
      });
    } else {
      // En Unix/Linux/Mac
      spawn(ollamaCommand, ['serve'], {
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
    } else {
      return { success: false, error: 'El servicio se inició pero no responde' };
    }
  } catch (error: any) {
    console.error('Error starting Ollama:', error);
    return { success: false, error: error?.message || 'Error desconocido' };
  }
}

// Verificar el estado completo de Ollama
async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const installed = await isOllamaInstalled();
    
    if (!installed) {
      return { installed: false, running: false };
    }
    
    const running = await isOllamaRunning();
    return { installed: true, running };
    
  } catch (error: any) {
    return { 
      installed: false, 
      running: false, 
      error: error?.message || 'Error desconocido'
    };
  }
}

export function registerOllamaServiceHandler() {
  // Verificar estado de Ollama
  ipcMain.handle('ollama:check-status', async (): Promise<OllamaStatus> => {
    console.log('[OLLAMA] Checking Ollama status...');
    const status = await checkOllamaStatus();
    console.log('[OLLAMA] Status:', status);
    return status;
  });

  // Iniciar servicio de Ollama
  ipcMain.handle('ollama:start-service', async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[OLLAMA] Starting Ollama service...');
    const result = await startOllama();
    console.log('[OLLAMA] Start result:', result);
    return result;
  });

  // Verificar si Ollama está instalado
  ipcMain.handle('ollama:is-installed', async (): Promise<boolean> => {
    console.log('[OLLAMA] Checking if Ollama is installed...');
    const installed = await isOllamaInstalled();
    console.log('[OLLAMA] Installed:', installed);
    return installed;
  });
}