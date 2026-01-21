import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Language } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { AiModelsComponent } from '../../core/components/ai-models/ai-models.component';

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

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeLanguage();
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
