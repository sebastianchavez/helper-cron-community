import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

export type OllamaStatus = 'running' | 'stopped' | 'unknown';

@Injectable({
  providedIn: 'root'
})
export class OllamaStatusService {
  private ollamaRunningSubject = new BehaviorSubject<boolean>(false);
  private ollamaStatusSubject = new BehaviorSubject<OllamaStatus>('unknown');
  
  // Observable para que otros componentes se suscriban
  ollamaRunning$ = this.ollamaRunningSubject.asObservable();
  status$ = this.ollamaStatusSubject.asObservable();

  constructor(private logger: LoggerService) {}

  /**
   * Actualizar el estado de Ollama
   */
  updateStatus(isRunning: boolean): void {
    this.logger.log('OLLAMA_STATUS_SVC', 'updateStatus', { info: `Updating Ollama status to: ${isRunning}` });
    this.ollamaRunningSubject.next(isRunning);
    this.ollamaStatusSubject.next(isRunning ? 'running' : 'stopped');
  }

  /**
   * Obtener el estado actual
   */
  getCurrentStatus(): boolean {
    return this.ollamaRunningSubject.value;
  }

  /**
   * Notificar que Ollama se detuvo
   */
  notifyOllamaStopped(): void {
    this.updateStatus(false);
  }

  /**
   * Notificar que Ollama se inició
   */
  notifyOllamaStarted(): void {
    this.updateStatus(true);
  }
}