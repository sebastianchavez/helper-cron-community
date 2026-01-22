import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  constructor() {}

  /**
   * Verificar si Ollama está ejecutándose verificando el proceso activo
   */
  isOllamaRunning(): Promise<boolean> {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    if (isWindows) {
      // En Windows, verificar si el proceso ollama.exe está corriendo
      const command = 'tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe"';
      return (window as any).agi.executeTerminalCommand(command).then(
        (result: any) => {
          console.log('[TerminalService] Ollama process check:', result);
          // Si el comando encuentra ollama.exe, devuelve true
          return result.success && result.output && result.output.toLowerCase().includes('ollama.exe');
        },
        (error: any) => {
          console.log('[TerminalService] Ollama process check failed:', error);
          return false;
        }
      );
    } else {
      // En Unix/Linux/Mac, usar pgrep
      const command = 'pgrep -f ollama > /dev/null';
      return (window as any).agi.executeTerminalCommand(command).then(
        (result: any) => {
          console.log('[TerminalService] Ollama process check:', result);
          return result.success;
        },
        (error: any) => {
          console.log('[TerminalService] Ollama process check failed:', error);
          return false;
        }
      );
    }
  }

  /**
   * Detener Ollama usando PowerShell (más efectivo en Windows)
   */
  stopOllama(): Promise<{ success: boolean; message: string }> {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    if (isWindows) {
      return this.stopOllamaWindows();
    } else {
      // En Unix/Linux/Mac
      const command = 'pkill -f ollama || true';
      return (window as any).agi.executeTerminalCommand(command).then(
        (result: any) => ({
          success: true,
          message: 'Ollama detenido correctamente'
        }),
        (error: any) => ({
          success: false,
          message: 'Error al detener Ollama: ' + (error.message || 'Error desconocido')
        })
      );
    }
  }

  /**
   * Detener Ollama en Windows con múltiples estrategias
   */
  private stopOllamaWindows(): Promise<{ success: boolean; message: string }> {
    // Usar una estrategia múltiple: primero taskkill, luego verificar
    const command = 'taskkill /F /IM ollama.exe && echo "Proceso ollama.exe terminado"';
    
    return (window as any).agi.executeTerminalCommand(command).then(
      (result: any) => {
        console.log('[TerminalService] Stop command result:', result);
        
        // Verificar el resultado del comando
        if (result.success) {
          return {
            success: true,
            message: 'Ollama detenido correctamente'
          };
        } else if (result.error && result.error.toLowerCase().includes('not found')) {
          return {
            success: true,
            message: 'Ollama no estaba ejecutándose'
          };
        } else {
          return {
            success: false,
            message: 'Error al detener Ollama: ' + (result.error || 'Error desconocido')
          };
        }
      },
      (error: any) => {
        console.error('[TerminalService] Error executing stop command:', error);
        return {
          success: false,
          message: 'Error al ejecutar comando: ' + (error.message || 'Error desconocido')
        };
      }
    );
  }

  /**
   * Verificar si Ollama está instalado
   */
  checkOllamaInstalled(): Promise<boolean> {
    return (window as any).agi.executeTerminalCommand('ollama --version').then(
      (result: any) => result.success,
      () => false
    );
  }
}