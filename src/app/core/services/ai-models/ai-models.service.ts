import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

export interface AIModel {
  id: string;
  name: string;
  size: string;
  lastUsed: Date | null;
  status: 'available' | 'downloading' | 'error';
  version?: string;
  family?: string;
}

// Interface for Ollama model response
interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
  };
}

// Interface for Ollama status
export interface OllamaStatus {
  installed: boolean;
  running: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIModelsService {
  private modelsSubject = new BehaviorSubject<AIModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private ollamaStatusSubject = new BehaviorSubject<OllamaStatus>({ installed: false, running: false });

  public models$ = this.modelsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public ollamaStatus$ = this.ollamaStatusSubject.asObservable();

  constructor(private logger: LoggerService) {}

  async loadModels(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    try {
      // Primero verificar el estado de Ollama
      await this.checkOllamaStatus();
      const status = this.ollamaStatusSubject.value;
      
      if (!status.installed) {
        this.errorSubject.next('OLLAMA_NOT_INSTALLED');
        this.modelsSubject.next([]);
        return;
      }
      
      if (!status.running) {
        this.errorSubject.next('OLLAMA_NOT_RUNNING');
        this.modelsSubject.next([]);
        return;
      }

      // Verificar si window.agi está disponible
      if (!window.agi?.chat?.listModels) {
        this.logger.error('AI_MODELS_SVC', 'loadModels', { info: 'Agi API not available' });
        throw new Error('Agi API not available');
      }

      this.logger.log('AI_MODELS_SVC', 'loadModels', { info: 'Requesting models from Ollama' });
      
      // Obtener modelos reales de Ollama usando la misma API que el chatbot
      const ollamaModels = await window.agi.chat.listModels();
      this.logger.log('AI_MODELS_SVC', 'loadModels', { info: 'Ollama response', response: ollamaModels });
      this.logger.log('AI_MODELS_SVC', 'loadModels', { info: `Ollama models found: ${ollamaModels.length}` });
      
      // Convertir modelos de Ollama al formato AIModel
      const aiModels: AIModel[] = ollamaModels.map(model => ({
        id: model.name,
        name: model.name,
        size: this.formatModelSize(model.size),
        lastUsed: new Date(model.modified_at),
        status: 'available' as const,
        version: model.digest?.slice(0, 12),
        family: model.details?.family || 'unknown'
      }));
      
      this.logger.log('AI_MODELS_SVC', 'loadModels', { info: 'AI models processed', response: aiModels });
      this.modelsSubject.next(aiModels);
    } catch (error) {
      this.logger.error('AI_MODELS_SVC', 'loadModels', { info: 'Error loading AI models', error });
      this.errorSubject.next('OLLAMA_CONNECTION_ERROR');
      this.modelsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async checkOllamaStatus(): Promise<OllamaStatus> {
    try {
      if (window.agi?.ollama?.checkStatus) {
        const status = await window.agi.ollama.checkStatus();
        this.ollamaStatusSubject.next(status);
        return status;
      } else {
        // Fallback para versiones anteriores
        const defaultStatus = { installed: true, running: true };
        this.ollamaStatusSubject.next(defaultStatus);
        return defaultStatus;
      }
    } catch (error: any) {
      this.logger.error('AI_MODELS_SVC', 'checkOllamaStatus', { info: 'Error checking Ollama status', error });
      const errorStatus = { installed: false, running: false, error: error?.message || 'Error desconocido' };
      this.ollamaStatusSubject.next(errorStatus);
      return errorStatus;
    }
  }

  async startOllama(): Promise<{ success: boolean; error?: string }> {
    try {
      if (window.agi?.ollama?.startService) {
        const result = await window.agi.ollama.startService();
        if (result.success) {
          // Esperar un momento y verificar el estado nuevamente
          setTimeout(() => this.checkOllamaStatus(), 2000);
        }
        return result;
      } else {
        return { success: false, error: 'Ollama service management not available' };
      }
    } catch (error: any) {
      this.logger.error('AI_MODELS_SVC', 'startOllama', { info: 'Error starting Ollama', error });
      return { success: false, error: error?.message || 'Error desconocido' };
    }
  }

  private formatModelSize(sizeInBytes: number): string {
    const gb = sizeInBytes / (1024 * 1024 * 1024);
    const mb = sizeInBytes / (1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    } else {
      return `${mb.toFixed(0)} MB`;
    }
  }

  async refreshModels(): Promise<void> {
    await this.loadModels();
  }

  getModels(): AIModel[] {
    return this.modelsSubject.value;
  }

  getModelById(id: string): AIModel | undefined {
    return this.modelsSubject.value.find(model => model.id === id);
  }

  getOllamaStatus(): OllamaStatus {
    return this.ollamaStatusSubject.value;
  }

  getInstalledModelsCount(): number {
    return this.modelsSubject.value.filter(model => model.status === 'available').length;
  }

  getTotalSize(): string {
    const models = this.modelsSubject.value;
    if (models.length === 0) {
      return '0 MB';
    }
    
    const totalMB = models.reduce((total, model) => {
      const sizeMatch = model.size.match(/([\d.]+)\s*(GB|MB)/);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        return total + (unit === 'GB' ? size * 1024 : size);
      }
      return total;
    }, 0);

    return totalMB > 1024 
      ? `${(totalMB / 1024).toFixed(1)} GB`
      : `${totalMB.toFixed(0)} MB`;
  }

  formatLastUsed(date: Date | null): string {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return date.toLocaleDateString();
  }
}