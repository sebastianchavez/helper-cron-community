import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AIModelsService, AIModel, OllamaStatus } from '../../services/ai-models/ai-models.service';
import { TranslationService } from '../../services/translation/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ai-models',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-[#1c2433] rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ 'models.title' | translate }}</h3>
        <button 
          (click)="refreshModels()"
          [disabled]="loading"
          class="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <span class="material-symbols-outlined" style="font-size: 16px;" 
                [class.animate-spin]="loading">refresh</span>
          <span>{{ 'models.refresh' | translate }}</span>
        </button>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="flex items-center justify-center gap-3">
          <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-slate-600 dark:text-slate-400">{{ 'models.loading' | translate }}</span>
        </div>
      </div>

      <!-- Estado de error -->
      <div *ngIf="error && !loading" class="text-center py-8">
        <span class="material-symbols-outlined text-red-400 text-4xl mb-3 block">error</span>
        <h4 class="text-lg font-medium text-red-700 dark:text-red-300 mb-2">{{ 'models.error' | translate }}</h4>
        <p class="text-sm text-red-600 dark:text-red-400 mb-4">{{ getErrorMessage() }}</p>
        
        <!-- Opciones específicas para problemas con Ollama -->
        <div *ngIf="error === 'OLLAMA_CONNECTION_ERROR' || error === 'OLLAMA_NOT_RUNNING' || error === 'OLLAMA_NOT_INSTALLED'" class="space-y-3">
          <!-- Ollama no instalado -->
          <div *ngIf="!ollamaStatus.installed" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-yellow-500 mt-0.5">warning</span>
              <div class="text-left">
                <h5 class="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  {{ 'models.ollamaNotInstalled' | translate }}
                </h5>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  {{ 'models.ollamaInstallPrompt' | translate }}
                </p>
                <a href="https://ollama.com" target="_blank" 
                   class="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm">
                  <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
                  {{ 'models.downloadOllama' | translate }}
                </a>
              </div>
            </div>
          </div>

          <!-- Ollama instalado pero no ejecutándose -->
          <div *ngIf="ollamaStatus.installed && !ollamaStatus.running" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-blue-500 mt-0.5">info</span>
              <div class="text-left">
                <h5 class="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {{ 'models.ollamaNotRunning' | translate }}
                </h5>
                <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  {{ 'models.ollamaStartPrompt' | translate }}
                </p>
                <button 
                  (click)="startOllama()"
                  [disabled]="startingOllama"
                  class="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors text-sm">
                  <span class="material-symbols-outlined" style="font-size: 16px;" 
                        [class.animate-spin]="startingOllama">{{ startingOllama ? 'refresh' : 'play_arrow' }}</span>
                  {{ startingOllama ? ('models.startingOllama' | translate) : ('models.startOllama' | translate) }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Botón de verificar estado después de mostrar opciones de Ollama -->
          <button 
            (click)="refreshModels()"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors text-sm">
            <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span>
            {{ 'models.refresh' | translate }}
          </button>
        </div>

        <!-- Botón de retry para otros tipos de errores -->
        <div *ngIf="error !== 'OLLAMA_CONNECTION_ERROR' && error !== 'OLLAMA_NOT_RUNNING' && error !== 'OLLAMA_NOT_INSTALLED'">
          <button 
            (click)="refreshModels()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm">
            <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span>
            {{ 'models.refresh' | translate }}
          </button>
        </div>
      </div>

      <!-- Lista de modelos -->
      <div *ngIf="!loading && !error" class="space-y-3">
        <!-- Resumen -->
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-slate-600 dark:text-slate-400">{{ 'models.installed' | translate }}:</span>
              <span class="ml-2 font-medium text-slate-900 dark:text-white">{{ models.length }}</span>
            </div>
            <div>
              <span class="text-slate-600 dark:text-slate-400">{{ 'models.size' | translate }}:</span>
              <span class="ml-2 font-medium text-slate-900 dark:text-white">{{ getTotalSize() }}</span>
            </div>
          </div>
        </div>

        <!-- Sin modelos -->
        <div *ngIf="models.length === 0 && !error" class="text-center py-8">
          <span class="material-symbols-outlined text-slate-400 text-4xl mb-3 block">smart_toy</span>
          <h4 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{{ 'models.noModels' | translate }}</h4>
          
          <!-- Mostrar mensaje específico según el estado de Ollama -->
          <div *ngIf="!ollamaStatus.installed" class="mb-6">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {{ 'models.ollamaInstallPrompt' | translate }}
            </p>
            <a href="https://ollama.com" target="_blank" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md">
              <span class="material-symbols-outlined" style="font-size: 18px;">download</span>
              {{ 'models.downloadOllama' | translate }}
            </a>
          </div>
          
          <div *ngIf="ollamaStatus.installed && !ollamaStatus.running" class="mb-6">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {{ 'models.ollamaStartPrompt' | translate }}
            </p>
            <button 
              (click)="startOllama()"
              [disabled]="startingOllama"
              class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium shadow-md">
              <span class="material-symbols-outlined" style="font-size: 18px;" 
                    [class.animate-spin]="startingOllama">{{ startingOllama ? 'refresh' : 'play_arrow' }}</span>
              {{ startingOllama ? ('models.startingOllama' | translate) : ('models.startOllama' | translate) }}
            </button>
          </div>
          
          <div *ngIf="ollamaStatus.installed && ollamaStatus.running" class="mb-6">
            <h5 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
              {{ 'models.recommendedModels' | translate }}
            </h5>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
              {{ 'models.selectModelToDownload' | translate }}
            </p>
            
            <!-- Lista de modelos recomendados -->
            <div class="grid gap-3 max-w-2xl mx-auto">
              <div *ngFor="let model of recommendedModels" 
                   class="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50 hover:border-primary/30 transition-colors">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h6 class="font-medium text-slate-900 dark:text-white">{{ model.displayName }}</h6>
                    <span class="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                      {{ 'models.modelSize' | translate }} {{ model.size }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ model.description }}</p>
                </div>
                <button 
                  (click)="downloadModel(model.name)"
                  [disabled]="isDownloading(model.name)"
                  class="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-md transition-colors text-sm font-medium">
                  <span class="material-symbols-outlined" style="font-size: 16px;" 
                        [class.animate-spin]="isDownloading(model.name)">
                    {{ isDownloading(model.name) ? 'refresh' : 'download' }}
                  </span>
                  {{ isDownloading(model.name) ? ('models.downloadingModel' | translate) : ('models.downloadModel' | translate) }}
                </button>
              </div>
            </div>
            
            <!-- Enlace a explorar más modelos -->
            <div class="text-center mt-6">
              <a href="https://ollama.com/library" target="_blank" 
                 class="text-sm text-primary hover:text-primary/80 transition-colors">
                {{ 'models.exploreModels' | translate }} →
              </a>
            </div>
          </div>
        </div>

        <!-- Lista de modelos -->
        <div *ngIf="models.length > 0" class="space-y-2">
          <div *ngFor="let model of models" 
               class="flex items-center justify-between p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            
            <!-- Información del modelo -->
            <div class="flex items-center gap-3">
              <!-- Indicador de estado -->
              <div class="flex-shrink-0">
                <span *ngIf="model.status === 'available'" 
                      class="w-3 h-3 bg-green-500 rounded-full block"
                      [title]="'models.available' | translate"></span>
                <span *ngIf="model.status === 'downloading'" 
                      class="w-3 h-3 bg-yellow-500 rounded-full block animate-pulse"
                      [title]="'models.downloading' | translate"></span>
                <span *ngIf="model.status === 'error'" 
                      class="w-3 h-3 bg-red-500 rounded-full block"
                      [title]="'models.error' | translate"></span>
              </div>

              <!-- Detalles del modelo -->
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-slate-900 dark:text-white">{{ model.name }}</h4>
                  <span *ngIf="model.version" 
                        class="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded font-mono">
                    {{ model.version }}
                  </span>
                  <span *ngIf="model.family && model.family !== 'unknown'" 
                        class="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    {{ model.family }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">storage</span>
                    {{ model.size }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">schedule</span>
                    {{ formatLastUsed(model.lastUsed) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div class="text-sm text-right">
              <div class="flex items-center gap-2">
                <span *ngIf="model.status === 'available'" 
                      class="text-green-600 dark:text-green-400 font-medium">
                  {{ 'models.available' | translate }}
                </span>
                <span *ngIf="model.status === 'downloading'" 
                      class="text-yellow-600 dark:text-yellow-400 font-medium">
                  {{ 'models.downloading' | translate }}
                </span>
                <span *ngIf="model.status === 'error'" 
                      class="text-red-600 dark:text-red-400 font-medium">
                  {{ 'models.error' | translate }}
                </span>
              </div>
              <div *ngIf="model.family" class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {{ model.family }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sección de modelos recomendados (siempre visible cuando Ollama está funcionando) -->
        <div *ngIf="ollamaStatus.installed && ollamaStatus.running && !loading && !error" class="mt-8">
          <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3 text-center">
              {{ 'models.recommendedModels' | translate }}
            </h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
              {{ 'models.selectModelToDownload' | translate }}
            </p>
            
            <!-- Lista de modelos recomendados -->
            <div class="grid gap-3 max-w-3xl mx-auto">
              <div *ngFor="let model of recommendedModels" 
                   class="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 hover:border-primary/30 transition-colors">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h6 class="font-medium text-slate-900 dark:text-white">{{ model.displayName }}</h6>
                    <span class="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                      {{ 'models.modelSize' | translate }} {{ model.size }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ model.description }}</p>
                </div>
                <div class="ml-4 flex items-center gap-2">
                  <!-- Mostrar si ya está instalado -->
                  <span *ngIf="isModelInstalled(model.name)" 
                        class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded font-medium">
                    {{ 'models.installed' | translate }}
                  </span>
                  <!-- Botón de descarga -->
                  <button 
                    *ngIf="!isModelInstalled(model.name)"
                    (click)="downloadModel(model.name)"
                    [disabled]="isDownloading(model.name)"
                    class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-md transition-colors text-sm font-medium">
                    <span class="material-symbols-outlined" style="font-size: 16px;" 
                          [class.animate-spin]="isDownloading(model.name)">
                      {{ isDownloading(model.name) ? 'refresh' : 'download' }}
                    </span>
                    {{ isDownloading(model.name) ? ('models.downloadingModel' | translate) : ('models.downloadModel' | translate) }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Enlace a explorar más modelos -->
            <div class="text-center mt-4">
              <a href="https://ollama.com/library" target="_blank" 
                 class="text-sm text-primary hover:text-primary/80 transition-colors">
                {{ 'models.exploreModels' | translate }} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AiModelsComponent implements OnInit, OnDestroy {
  models: AIModel[] = [];
  loading = false;
  error: string | null = null;
  ollamaStatus: OllamaStatus = { installed: false, running: false };
  startingOllama = false;
  downloadingModels = new Set<string>();
  private destroy$ = new Subject<void>();

  // Modelos recomendados populares
  recommendedModels = [
    {
      name: 'llama3.2',
      displayName: 'Llama 3.2',
      size: '2.0GB',
      description: 'Modelo versátil de Meta, excelente para conversación general'
    },
    {
      name: 'phi3.5',
      displayName: 'Phi 3.5',
      size: '2.2GB', 
      description: 'Modelo eficiente de Microsoft, rápido y preciso'
    },
    {
      name: 'qwen2.5',
      displayName: 'Qwen 2.5',
      size: '1.5GB',
      description: 'Modelo ligero con excelente rendimiento multiidioma'
    },
    {
      name: 'codellama',
      displayName: 'Code Llama',
      size: '3.8GB',
      description: 'Especializado en programación y generación de código'
    }
  ];

  constructor(
    private aiModelsService: AIModelsService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    // Suscribirse a los modelos
    this.aiModelsService.models$
      .pipe(takeUntil(this.destroy$))
      .subscribe(models => {
        this.models = models;
      });

    // Suscribirse al estado de carga
    this.aiModelsService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    // Suscribirse a errores
    this.aiModelsService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });

    // Cargar modelos inicialmente
    this.loadModels();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadModels() {
    await this.checkOllamaStatus();
    await this.aiModelsService.loadModels();
  }

  async refreshModels() {
    await this.checkOllamaStatus();
    await this.aiModelsService.refreshModels();
  }

  async checkOllamaStatus() {
    try {
      this.ollamaStatus = await this.aiModelsService.checkOllamaStatus();
    } catch (error: any) {
      console.error('Error checking Ollama status:', error);
      this.ollamaStatus = { installed: false, running: false, error: 'Error al verificar el estado de Ollama' };
    }
  }

  async startOllama() {
    if (this.startingOllama || !this.ollamaStatus.installed) return;
    
    this.startingOllama = true;
    try {
      await this.aiModelsService.startOllama();
      // Esperar un momento y verificar el estado nuevamente
      setTimeout(async () => {
        await this.checkOllamaStatus();
        if (this.ollamaStatus.running) {
          // Si Ollama se está ejecutando, intentar cargar modelos
          await this.aiModelsService.refreshModels();
        }
      }, 3000);
    } catch (error: any) {
      console.error('Error starting Ollama:', error);
      this.ollamaStatus = { ...this.ollamaStatus, error: 'Error al iniciar Ollama' };
    } finally {
      this.startingOllama = false;
    }
  }

  async downloadModel(modelName: string) {
    if (this.downloadingModels.has(modelName)) return;
    
    this.downloadingModels.add(modelName);
    try {
      // Usar la API de window.agi para descargar el modelo
      if (window.agi?.chat?.downloadModel) {
        const result = await window.agi.chat.downloadModel(modelName);
        if (result.success) {
          // Refrescar la lista de modelos después de la descarga exitosa
          await this.refreshModels();
        } else {
          console.error('Error downloading model:', result.error);
        }
      } else {
        console.error('Download model API not available');
      }
    } catch (error: any) {
      console.error('Error downloading model:', error);
    } finally {
      this.downloadingModels.delete(modelName);
    }
  }

  isDownloading(modelName: string): boolean {
    return this.downloadingModels.has(modelName);
  }

  isModelInstalled(modelName: string): boolean {
    return this.models.some(model => 
      model.name.toLowerCase().includes(modelName.toLowerCase()) || 
      model.id.toLowerCase().includes(modelName.toLowerCase())
    );
  }

  getTotalSize(): string {
    return this.aiModelsService.getTotalSize();
  }

  formatLastUsed(date: Date | null): string {
    if (!date) {
      return 'Nunca';
    }
    
    return this.aiModelsService.formatLastUsed(date);
  }

  getErrorMessage(): string {
    if (this.error === 'OLLAMA_CONNECTION_ERROR') {
      return this.translationService.translate('models.ollamaError');
    }
    if (this.error === 'OLLAMA_NOT_RUNNING') {
      return this.translationService.translate('models.ollamaNotRunningError');
    }
    if (this.error === 'OLLAMA_NOT_INSTALLED') {
      return this.translationService.translate('models.ollamaNotInstalledError');
    }
    return this.error || this.translationService.translate('models.error');
  }
}