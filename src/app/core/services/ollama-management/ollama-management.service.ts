import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AIModelsService, OllamaStatus } from '../ai-models/ai-models.service';
import { LoggerService } from '../logger/logger.service';
import { ModelHelper } from '../../../shared/helpers';

export interface OllamaModalState {
  show: boolean;
  status: OllamaStatus;
  isStarting: boolean;
  startError: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OllamaManagementService {
  private modalStateSubject = new BehaviorSubject<OllamaModalState>({
    show: false,
    status: { installed: false, running: false },
    isStarting: false,
    startError: null
  });

  public modalState$ = this.modalStateSubject.asObservable();

  constructor(
    private aiModelsService: AIModelsService,
    private logger: LoggerService,
    private router: Router
  ) {}

  async checkOllamaOnStartup(): Promise<OllamaStatus> {
    try {
      const status = await this.aiModelsService.checkOllamaStatus();
      this.updateModalState({ show: !status.installed || !status.running, status, isStarting: false, startError: null });
      return status;
    } catch (error) {
      const errorStatus = { installed: false, running: false, error: 'Error al verificar Ollama' };
      this.updateModalState({ show: true, status: errorStatus, isStarting: false, startError: null });
      return errorStatus;
    }
  }

  async startOllamaService(): Promise<{ success: boolean; error?: string }> {
    this.updateModalState({ ...this.modalStateSubject.value, isStarting: true, startError: null });
    try {
      const result = await this.aiModelsService.startOllama();
      if (result.success) {
        setTimeout(async () => {
          const newStatus = await this.aiModelsService.checkOllamaStatus();
          this.updateModalState({ show: !newStatus.running, status: newStatus, isStarting: false, startError: null });
        }, 3000);
        return { success: true };
      } else {
        const errorMsg = result.error || 'Error desconocido al iniciar Ollama';
        this.updateModalState({ ...this.modalStateSubject.value, isStarting: false, startError: errorMsg });
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Error al iniciar Ollama';
      this.updateModalState({ ...this.modalStateSubject.value, isStarting: false, startError: errorMsg });
      return { success: false, error: errorMsg };
    }
  }

  closeModal(): void {
    this.updateModalState({ ...this.modalStateSubject.value, show: false });
  }

  openSettings(): void {
    this.router.navigate(['/settings']);
    this.closeModal();
  }

  openOllamaWebsite(): void {
    if (window.agi?.openExternalLink) {
      window.agi.openExternalLink('https://ollama.com');
    } else {
      window.open('https://ollama.com', '_blank');
    }
  }

  async preloadSavedModel(models: any[]): Promise<void> {
    const savedModel = ModelHelper.getSavedModel(models, this.logger);
    if (savedModel) {
      await ModelHelper.preloadModel(savedModel, window.agi?.chat, this.logger);
    }
  }

  getCurrentModalState(): OllamaModalState {
    return this.modalStateSubject.value;
  }

  private updateModalState(newState: OllamaModalState): void {
    this.modalStateSubject.next(newState);
  }
}
