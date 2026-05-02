import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSimpliAlertService } from 'ngx-simpli-alert';
import { AIModelsService, AIModel, OllamaStatus } from '../../services/ai-models/ai-models.service';
import { TranslationService } from '../../services/translation/translation.service';
import { OllamaStatusService, OllamaStatus as OllamaServiceStatus } from '../../services/ollama-status/ollama-status.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoggerService } from '../../services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ai-models',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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
                <button 
                   (click)="openOllamaWebsite()"
                   class="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm">
                  <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
                  {{ 'models.downloadOllama' | translate }}
                </button>
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
      <div *ngIf="!loading && !error" class="space-y-2">
        <!-- Resumen + filtro -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
            <span>{{ 'models.installed' | translate }}: <strong class="text-slate-900 dark:text-white">{{ models.length }}</strong></span>
            <span class="opacity-40">|</span>
            <span>{{ 'models.size' | translate }}: <strong class="text-slate-900 dark:text-white">{{ getTotalSize() }}</strong></span>
          </div>
          <!-- Búsqueda -->
          <div *ngIf="models.length > 0" class="flex-1 flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-lg">
            <span class="material-symbols-outlined text-slate-400 flex-shrink-0" style="font-size:14px;">search</span>
            <input [(ngModel)]="localModelFilter" type="text"
              placeholder="{{ 'models.filterPlaceholder' | translate }}"
              class="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none" />
            <button *ngIf="localModelFilter" (click)="localModelFilter=''" class="text-slate-400 hover:text-slate-600">
              <span class="material-symbols-outlined" style="font-size:13px;">close</span>
            </button>
          </div>
        </div>

        <!-- Sin modelos -->
        <div *ngIf="models.length === 0 && !error" class="text-center py-8">
          <span class="material-symbols-outlined text-slate-400 text-4xl mb-3 block">smart_toy</span>
          
          <!-- Mostrar mensaje específico según el estado de Ollama -->
          <div *ngIf="!ollamaStatus.installed" class="mb-6">
            <h4 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{{ 'models.ollamaNotInstalled' | translate }}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {{ 'models.ollamaInstallRequired' | translate }}
            </p>
            <div class="space-y-3 max-w-xs mx-auto">
              <button 
                 (click)="openOllamaWebsite()"
                 class="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md w-full">
                <span class="material-symbols-outlined" style="font-size: 18px;">download</span>
                {{ 'models.downloadOllama' | translate }}
              </button>
              <p class="text-xs text-slate-400">{{ 'models.refreshAfterInstall' | translate }}</p>
            </div>
          </div>
          
          <div *ngIf="ollamaStatus.installed && !ollamaStatus.running" class="mb-6">
            <h4 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{{ 'models.ollamaNotRunning' | translate }}</h4>
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
            <h4 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{{ 'models.noModels' | translate }}</h4>
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
                <div class="ml-4 flex flex-col items-end gap-2">
                  <button 
                    (click)="downloadModel(model.name)"
                    [disabled]="isDownloading(model.name)"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-md transition-colors text-sm font-medium">
                    <span class="material-symbols-outlined" style="font-size: 16px;" 
                          [class.animate-spin]="isDownloading(model.name)">
                      {{ isDownloading(model.name) ? 'refresh' : 'download' }}
                    </span>
                    {{ isDownloading(model.name) ? ('models.downloadingModel' | translate) : ('models.downloadModel' | translate) }}
                  </button>
                  
                  <!-- Barra de progreso -->
                  <div *ngIf="isDownloading(model.name) && getDownloadProgress(model.name)" 
                       class="w-full max-w-[200px] bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div class="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                         [style.width.%]="getDownloadProgress(model.name)?.progress || 0">
                    </div>
                  </div>
                  
                  <!-- Información de progreso -->
                  <div *ngIf="isDownloading(model.name) && getDownloadProgress(model.name)" 
                       class="text-xs text-slate-500 dark:text-slate-400 text-right w-full max-w-[200px]">
                    <div class="flex justify-between items-center">
                      <span *ngIf="getDownloadProgress(model.name)?.phase">{{ getDownloadProgress(model.name)?.phase }}</span>
                      <span>{{ getDownloadProgress(model.name)?.progress || 0 }}%</span>
                    </div>
                    <div *ngIf="getDownloadProgress(model.name)?.completed && getDownloadProgress(model.name)?.total">
                      {{ formatBytes(getDownloadProgress(model.name)!.completed!) }} / 
                      {{ formatBytes(getDownloadProgress(model.name)!.total!) }}
                    </div>
                  </div>
                  
                  <!-- Mensaje de error de descarga -->
                  <div *ngIf="getDownloadProgress(model.name)?.status === 'error'" 
                       class="w-full max-w-[200px] text-xs text-red-500 dark:text-red-400 mt-1">
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined" style="font-size: 12px;">error</span>
                      <span>{{ 'models.downloadError' | translate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Enlace a explorar más modelos -->
            <div class="text-center mt-6">
              <button 
                 (click)="openOllamaLibrary()"
                 class="text-sm text-primary hover:text-primary/80 transition-colors underline bg-transparent border-none cursor-pointer">
                {{ 'models.exploreModels' | translate }} →
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de modelos instalados -->
        <div *ngIf="models.length > 0" class="space-y-1">
          <!-- Cabecera de grupo local -->
          <div class="flex items-center gap-2 px-1 py-1 mb-1">
            <span class="material-symbols-outlined text-slate-400" style="font-size:14px;">computer</span>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ 'models.sectionLocal' | translate }}</span>
            <span class="ml-1 text-xs text-slate-400">({{ filteredModels.length }})</span>
          </div>

          <!-- Sin resultados de filtro -->
          <div *ngIf="filteredModels.length === 0" class="text-center py-4 text-xs text-slate-400">
            {{ 'models.noFilterResults' | translate }}
          </div>

          <div *ngFor="let model of filteredModels" 
               class="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            
            <!-- Información del modelo -->
            <div class="flex items-center gap-2 min-w-0">
              <!-- Indicador de estado -->
              <span *ngIf="model.status === 'available'" 
                    class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              <span *ngIf="model.status === 'downloading'" 
                    class="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 animate-pulse"></span>
              <span *ngIf="model.status === 'error'" 
                    class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>

              <!-- Detalles -->
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ model.name }}</span>
                  <span *ngIf="model.family && model.family !== 'unknown'" 
                        class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded leading-none">
                    {{ model.family }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{{ model.size }}</span>
                  <span>{{ formatLastUsed(model.lastUsed) }}</span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <button 
              (click)="deleteModel(model.name)"
              [disabled]="isDeleting(model.name) || model.status === 'downloading'"
              class="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-2"
              [title]="'models.deleteModel' | translate">
              <span class="material-symbols-outlined" style="font-size: 15px;" 
                    [class.animate-spin]="isDeleting(model.name)">
                {{ isDeleting(model.name) ? 'refresh' : 'delete' }}
              </span>
            </button>
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
  deletingModels = new Set<string>();
  showExpandedModels = false;
  localModelFilter = '';

  get filteredModels(): AIModel[] {
    if (!this.localModelFilter.trim()) return this.models;
    const f = this.localModelFilter.toLowerCase();
    return this.models.filter(m => m.name.toLowerCase().includes(f) || (m.family || '').toLowerCase().includes(f));
  }

  // Progreso de descarga por modelo
  downloadProgress = new Map<string, {
    progress: number;
    status: string;
    completed?: number;
    total?: number;
    phase?: string;
  }>();
  private destroy$ = new Subject<void>();
  private downloadProgressCleanup?: () => void;

  // Modelos recomendados populares con tamaños reales
  recommendedModels = [
    {
      name: 'llama3.2:1b',
      displayName: 'Llama 3.2 1B',
      size: '1.3GB',
      description: 'Modelo compacto de Meta, ideal para dispositivos con recursos limitados'
    },
    {
      name: 'phi3.5:3.8b',
      displayName: 'Phi 3.5',
      size: '2.2GB', 
      description: 'Modelo eficiente de Microsoft, rápido y preciso'
    },
    {
      name: 'qwen2.5:3b',
      displayName: 'Qwen 2.5 3B',
      size: '1.9GB',
      description: 'Modelo ligero con excelente rendimiento multiidioma'
    },
    {
      name: 'codellama:7b',
      displayName: 'Code Llama 7B',
      size: '3.8GB',
      description: 'Especializado en programación y generación de código'
    }
  ];

  // Lista expandida de modelos adicionales
  expandedModels = [
    {
      name: 'llama3.2:3b',
      displayName: 'Llama 3.2 3B',
      size: '2.0GB',
      description: 'Versión más potente de Llama 3.2 para mejor rendimiento'
    },
    {
      name: 'gemma2:2b',
      displayName: 'Gemma 2 2B',
      size: '1.6GB',
      description: 'Modelo ligero de Google, eficiente para tareas generales'
    },
    {
      name: 'mistral:7b',
      displayName: 'Mistral 7B',
      size: '4.1GB',
      description: 'Modelo versátil con excelente capacidad de razonamiento'
    },
    {
      name: 'neural-chat:7b',
      displayName: 'Neural Chat 7B',
      size: '4.1GB',
      description: 'Optimizado para conversaciones naturales y fluidas'
    },
    {
      name: 'vicuna:7b',
      displayName: 'Vicuna 7B',
      size: '3.8GB',
      description: 'Modelo entrenado para seguir instrucciones complejas'
    },
    {
      name: 'orca-mini:3b',
      displayName: 'Orca Mini 3B',
      size: '1.9GB',
      description: 'Modelo compacto pero potente para uso general'
    },
    {
      name: 'starling-lm:7b',
      displayName: 'Starling LM 7B',
      size: '4.1GB',
      description: 'Modelo entrenado con refuerzo desde feedback humano'
    },
    {
      name: 'solar:10.7b',
      displayName: 'Solar 10.7B',
      size: '6.1GB',
      description: 'Modelo de alta capacidad con excelente rendimiento'
    }
  ];

  constructor(
    private aiModelsService: AIModelsService,
    private translationService: TranslationService,
    private ollamaStatusService: OllamaStatusService,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
    private alertService: NgxSimpliAlertService
  ) {}

  ngOnInit() {
    // Configurar listener de progreso de descarga
    if (window.agi?.chat?.onDownloadProgress) {
      this.downloadProgressCleanup = window.agi.chat.onDownloadProgress((progress) => {
        this.logger.log('AI_MODELS', 'ngOnInit', { info: 'Download progress received', response: progress });
        
        // Actualizar el progreso con información de fase
        this.downloadProgress.set(progress.modelName, {
          progress: progress.progress || 0,
          status: progress.status,
          completed: progress.completed,
          total: progress.total,
          phase: progress.phase || this.getPhaseDisplayName(progress.status)
        });
        
        if (progress.status === 'completed' || progress.status === 'error' || progress.status === 'success') {
          this.downloadingModels.delete(progress.modelName);
          if (progress.status === 'completed' || progress.status === 'success') {
            // Refrescar modelos después de completar descarga
            setTimeout(() => {
              this.refreshModels();
              this.cdr.detectChanges();
            }, 1000);
          } else if (progress.status === 'error') {
            // Mostrar error por más tiempo para que el usuario lo vea
            this.logger.error('AI_MODELS', 'ngOnInit', { info: 'Download error for model', error: { modelName: progress.modelName, error: progress.error } });
          }
          
          // Limpiar progreso después de un momento (más tiempo para errores)
          const clearDelay = progress.status === 'error' ? 5000 : 2000;
          setTimeout(() => {
            this.downloadProgress.delete(progress.modelName);
            this.cdr.detectChanges();
          }, clearDelay);
        }
        
        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();
      });
    } else {
      this.logger.warn('AI_MODELS', 'ngOnInit', { info: 'Download progress API not available' });
    }

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

    // Subscribe to Ollama status changes
    this.ollamaStatusService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: OllamaServiceStatus) => {
        this.logger.log('AI_MODELS', 'statusSubscription', { info: 'Ollama status changed', response: status });
        if (status === 'stopped') {
          this.logger.log('AI_MODELS', 'statusSubscription', { info: 'Ollama stopped, refreshing models list' });
          this.refreshModels();
        }
      });

    // Cargar modelos inicialmente
    this.loadModels();
  }

  ngOnDestroy() {
    // Limpiar listener de progreso
    if (this.downloadProgressCleanup) {
      this.downloadProgressCleanup();
    }
    
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
      this.logger.error('AI_MODELS', 'checkOllamaStatus', { info: 'Error checking Ollama status', error });
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
      this.logger.error('AI_MODELS', 'startOllama', { info: 'Error starting Ollama', error });
      this.ollamaStatus = { ...this.ollamaStatus, error: 'Error al iniciar Ollama' };
    } finally {
      this.startingOllama = false;
    }
  }

  async downloadModel(modelName: string) {
    if (this.downloadingModels.has(modelName)) return;
    
    this.logger.log('AI_MODELS', 'downloadModel', { info: `Starting download for model: ${modelName}` });
    this.downloadingModels.add(modelName);
    // Inicializar progreso con fase
    this.downloadProgress.set(modelName, {
      progress: 0,
      status: 'starting',
      phase: 'Iniciando...'
    });
    
    try {
      // Usar la API de window.agi para descargar el modelo
      if (window.agi?.chat?.downloadModel) {
        const result = await window.agi.chat.downloadModel(modelName);
        if (!result.success) {
          this.logger.error('AI_MODELS', 'downloadModel', { info: 'Error downloading model', error: result.error });
          this.downloadingModels.delete(modelName);
          this.downloadProgress.delete(modelName);
        }
        // El progreso y completion se maneja vía eventos
      } else {
        this.logger.error('AI_MODELS', 'downloadModel', { info: 'Download model API not available' });
        this.downloadingModels.delete(modelName);
        this.downloadProgress.delete(modelName);
      }
    } catch (error: any) {
      this.logger.error('AI_MODELS', 'downloadModel', { info: 'Error downloading model', error });
      this.downloadingModels.delete(modelName);
      this.downloadProgress.delete(modelName);
    }
  }

  async deleteModel(modelName: string) {
    if (this.deletingModels.has(modelName)) return;
    
    this.alertService.show({
      title: this.translationService.translate('models.deleteTitle'),
      description: this.translationService.translate('models.deleteDescription').replace('{modelName}', modelName),
      type: 'question',
      confirmButtonText: this.translationService.translate('common.delete'),
      cancelButtonText: this.translationService.translate('common.cancel')
    }, 
    async () => {
      this.deletingModels.add(modelName);
      try {
        if (window.agi?.chat?.deleteModel) {
          const result = await window.agi.chat.deleteModel(modelName);
          if (result.success) {
            // Refrescar la lista de modelos después de la eliminación exitosa
            await this.refreshModels();
          } else {
            this.logger.error('AI_MODELS', 'deleteModel', { info: 'Error deleting model', error: result.error });
            this.alertService.show({
              title: this.translationService.translate('common.error'),
              description: `${this.translationService.translate('models.deleteError')}: ${result.error}`,
              type: 'danger',
              confirmButtonText: this.translationService.translate('common.accept')
            });
          }
        } else {
          this.logger.error('AI_MODELS', 'deleteModel', { info: 'Delete model API not available' });
        }
      } catch (error: any) {
        this.logger.error('AI_MODELS', 'deleteModel', { info: 'Error deleting model', error });
        this.alertService.show({
          title: this.translationService.translate('common.error'),
          description: `${this.translationService.translate('models.deleteError')}: ${error.message}`,
          type: 'danger',
          confirmButtonText: this.translationService.translate('common.accept')
        });
      } finally {
        this.deletingModels.delete(modelName);
      }
    });
  }

  isDownloading(modelName: string): boolean {
    return this.downloadingModels.has(modelName);
  }

  isDeleting(modelName: string): boolean {
    return this.deletingModels.has(modelName);
  }

  getDownloadProgress(modelName: string): { progress: number; status: string; completed?: number; total?: number; phase?: string } | null {
    return this.downloadProgress.get(modelName) || null;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  openOllamaWebsite(): void {
    if (window.agi?.openExternalLink) {
      window.agi.openExternalLink('https://ollama.com');
    } else {
      // Fallback para desarrollo
      window.open('https://ollama.com', '_blank');
    }
  }

  toggleExpandedModels(): void {
    this.showExpandedModels = !this.showExpandedModels;
  }

  openOllamaLibrary(): void {
    // Abrir en el navegador web del sistema usando Electron
    if (window.agi?.openExternalLink) {
      window.agi.openExternalLink('https://ollama.com/library');
    } else {
      // Fallback si la API no está disponible
      window.open('https://ollama.com/library', '_blank');
    }
  }

  private getPhaseDisplayName(phase: string): string {
    const phaseNames: { [key: string]: string } = {
      'starting': 'Iniciando...',
      'pulling': 'Descargando...',
      'downloading': 'Descargando...',
      'verifying sha256': 'Verificando...',
      'writing manifest': 'Instalando...',
      'removing any unused layers': 'Finalizando...',
      'success': 'Completado',
      'completed': 'Completado'
    };
    
    return phaseNames[phase] || phase;
  }

}