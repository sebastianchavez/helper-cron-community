import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Language } from '../../core/services/translation/translation.service';
import { TerminalService } from '../../core/services/terminal/terminal.service';
import { OllamaStatusService } from '../../core/services/ollama-status/ollama-status.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { AiModelsComponent } from '../../core/components/ai-models/ai-models.component';
import { AIModelsService } from '../../core/services/ai-models/ai-models.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NavigationMenuComponent, AiModelsComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  showUserMenu = false;
  isDarkMode = false;
  availableLanguages: Language[] = [];
  currentLanguage = 'es';
  showLanguageDropdown = false;
  stoppingOllama = false;
  ollamaStopMessage = '';
  ollamaIsRunning = false;
  checkingOllamaStatus = true;
  private destroy$ = new Subject<void>();
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private terminalService: TerminalService,
    private ollamaStatusService: OllamaStatusService,
    private aiModelsService: AIModelsService
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeLanguage();
    this.checkOllamaStatus();

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
  }

  /**
   * Verificar si Ollama está corriendo
   */
  private async checkOllamaStatus(): Promise<void> {
    this.checkingOllamaStatus = true;
    try {
      this.ollamaIsRunning = await this.terminalService.isOllamaRunning();
      console.log('[Settings] Ollama running:', this.ollamaIsRunning);
    } catch (error: any) {
      console.error('[Settings] Error checking Ollama status:', error);
      this.ollamaIsRunning = false;
    } finally {
      this.checkingOllamaStatus = false;
    }
  }

  /**
   * Refrescar manualmente el estado de Ollama
   */
  async refreshOllamaStatus(): Promise<void> {
    await this.checkOllamaStatus();
  }

  // Métodos del menú de navegación
  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  navigateToSettings(): void {
    this.showUserMenu = false;
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
    this.showUserMenu = false;
  }

  getPlatformName(): string {
    return navigator.platform || 'Unknown';
  }

  // Métodos del menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.showUserMenu = false;
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  initializeLanguage(): void {
    this.availableLanguages = this.translationService.availableLanguages;
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  changeLanguage(languageCode: string): void {
    this.translationService.setLanguage(languageCode);
    this.currentLanguage = languageCode;
    this.showLanguageDropdown = false;
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  getCurrentLanguageName(): string {
    return this.translationService.getLanguageName(this.currentLanguage);
  }

  openAbout(): void {
    console.log('Mostrando información de la aplicación...');
    this.showUserMenu = false;
  }

  /**
   * Detener Ollama
   */
  async stopOllama(): Promise<void> {
    this.stoppingOllama = true;
    this.ollamaStopMessage = '';

    try {
      const result = await this.terminalService.stopOllama();
      
      if (result.success) {
        this.ollamaStopMessage = result.message;
        console.log('[Settings] Ollama stopped successfully:', result.message);
        
        // Notify other components that Ollama has been stopped
        this.ollamaStatusService.notifyOllamaStopped();
        
        // Esperar un momento y verificar si realmente se detuvo
        setTimeout(async () => {
          const isStillRunning = await this.terminalService.isOllamaRunning();
          if (isStillRunning) {
            this.ollamaStopMessage = 'Advertencia: Ollama sigue ejecutándose. Intenta cerrar la aplicación manualmente.';
            this.ollamaIsRunning = true;
          } else {
            this.ollamaStopMessage = 'Ollama detenido correctamente';
            this.ollamaIsRunning = false;
            
            // Limpiar mensaje después de 2 segundos ya que Ollama se detuvo
            setTimeout(() => {
              this.ollamaStopMessage = '';
            }, 2000);
          }
        }, 1500);
      } else {
        this.ollamaStopMessage = 'Error: ' + result.message;
        console.error('[Settings] Error stopping Ollama:', result.message);
        
        // Limpiar mensaje después de 5 segundos para errores
        setTimeout(() => {
          this.ollamaStopMessage = '';
        }, 5000);
      }
    } catch (error: any) {
      this.ollamaStopMessage = 'Error: ' + (error.message || 'Error desconocido');
      console.error('[Settings] Exception stopping Ollama:', error);
      
      // Limpiar mensaje después de 5 segundos para errores
      setTimeout(() => {
        this.ollamaStopMessage = '';
      }, 5000);
    } finally {
      this.stoppingOllama = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Element;
    
    if (this.showUserMenu && !target.closest('.relative')) {
      this.showUserMenu = false;
    }
    
    if (this.showLanguageDropdown && !target.closest('.language-dropdown')) {
      this.showLanguageDropdown = false;
    }
  }
}
