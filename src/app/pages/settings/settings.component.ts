import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Language } from '../../core/services/translation/translation.service';
import { TerminalService } from '../../core/services/terminal/terminal.service';
import { OllamaStatusService } from '../../core/services/ollama-status/ollama-status.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { AIModelsService } from '../../core/services/ai-models/ai-models.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NavigationMenuComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  showUserMenu = false;
  isDarkMode = false;
  themeMode: 'light' | 'dark' | 'system' = 'system';
  accentColor = 'blue';
  customAccentColor = '#3b82f6';
  showCustomColorPicker = false;
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

  accentColors = [
    { key: 'blue',   color: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    { key: 'green',  color: '#22c55e', light: '#4ade80', dark: '#16a34a' },
    { key: 'pink',   color: '#ec4899', light: '#f472b6', dark: '#db2777' },
    { key: 'amber',  color: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    { key: 'violet', color: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
  ];

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private terminalService: TerminalService,
    private ollamaStatusService: OllamaStatusService,
    private aiModelsService: AIModelsService,
    private logger: LoggerService
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
      this.logger.log('SETTINGS', 'checkOllamaStatus', {
        info: 'Ollama status checked',
        response: { ollamaIsRunning: this.ollamaIsRunning }
      });
    } catch (error: any) {
      this.logger.error('SETTINGS', 'checkOllamaStatus', {
        info: 'Error checking Ollama status',
        error
      });
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

  navigateToModels(): void {
    this.router.navigate(['/ai-models']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }

  getPlatformName(): string {
    return navigator.platform || 'Unknown';
  }

  // Métodos del menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  initializeTheme(): void {
    // Load theme mode
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | 'system' | null;
    this.themeMode = savedMode || 'system';

    // Load accent color
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
      this.accentColor = savedAccent;
    }
    const savedCustomColor = localStorage.getItem('customAccentColor');
    if (savedCustomColor) {
      this.customAccentColor = savedCustomColor;
    }

    this.applyThemeMode();
    this.applyAccentColor();
  }

  setThemeMode(mode: 'light' | 'dark' | 'system'): void {
    this.themeMode = mode;
    localStorage.setItem('themeMode', mode);
    this.applyThemeMode();
    this.showUserMenu = false;
  }

  toggleTheme(): void {
    // Kept for backward compatibility
    this.setThemeMode(this.isDarkMode ? 'light' : 'dark');
  }

  private applyThemeMode(): void {
    let shouldBeDark: boolean;

    if (this.themeMode === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = this.themeMode === 'dark';
    }

    this.isDarkMode = shouldBeDark;

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Also save old format for backward compat
    localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
  }

  setAccentColor(colorKey: string): void {
    this.accentColor = colorKey;
    this.showCustomColorPicker = false;
    localStorage.setItem('accentColor', colorKey);
    this.applyAccentColor();
  }

  setCustomAccentColor(hex: string): void {
    this.customAccentColor = hex;
    this.accentColor = 'custom';
    localStorage.setItem('accentColor', 'custom');
    localStorage.setItem('customAccentColor', hex);
    this.applyAccentColor();
  }

  toggleCustomColorPicker(): void {
    this.accentColor = 'custom';
    this.showCustomColorPicker = true;
    localStorage.setItem('accentColor', 'custom');
    this.applyAccentColor();
  }

  private applyAccentColor(): void {
    const root = document.documentElement;

    if (this.accentColor === 'custom') {
      root.style.setProperty('--accent', this.customAccentColor);
      root.style.setProperty('--accent-light', this.customAccentColor);
      root.style.setProperty('--accent-dark', this.customAccentColor);
      return;
    }

    const found = this.accentColors.find(c => c.key === this.accentColor);
    if (found) {
      root.style.setProperty('--accent', found.color);
      root.style.setProperty('--accent-light', found.light);
      root.style.setProperty('--accent-dark', found.dark);
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
    this.logger.log('SETTINGS', 'openAbout', {
      info: 'Opening application information',
      response: {}
    });
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
        this.logger.log('SETTINGS', 'stopOllama', {
          info: 'Ollama stopped successfully',
          response: { message: result.message }
        });
        
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
        this.logger.error('SETTINGS', 'stopOllama', {
          info: 'Error stopping Ollama',
          error: result.message
        });
        
        // Limpiar mensaje después de 5 segundos para errores
        setTimeout(() => {
          this.ollamaStopMessage = '';
        }, 5000);
      }
    } catch (error: any) {
      this.ollamaStopMessage = 'Error: ' + (error.message || 'Error desconocido');
      this.logger.error('SETTINGS', 'stopOllama', {
        info: 'Exception stopping Ollama',
        error
      });
      
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
