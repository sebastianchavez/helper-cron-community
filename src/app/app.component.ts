import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'electron-chatbot-ia-app';

  private accentColors = [
    { key: 'blue',   color: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    { key: 'green',  color: '#22c55e', light: '#4ade80', dark: '#16a34a' },
    { key: 'pink',   color: '#ec4899', light: '#f472b6', dark: '#db2777' },
    { key: 'amber',  color: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    { key: 'violet', color: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
  ];

  constructor(
    private translationService: TranslationService
  ) {
    const lang = localStorage.getItem('app-language');
    if (lang) {
      this.translationService.setLanguage(lang);
    } else {
      this.translationService.setLanguage('es');
    }
  }

  ngOnInit(): void {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Apply theme mode (light/dark/system)
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | 'system' | null;
    const themeMode = savedMode || 'system';

    let shouldBeDark: boolean;
    if (themeMode === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = themeMode === 'dark';
    }

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color
    const accentColor = localStorage.getItem('accentColor') || 'blue';
    const customAccentColor = localStorage.getItem('customAccentColor') || '#3b82f6';
    const root = document.documentElement;

    if (accentColor === 'custom') {
      root.style.setProperty('--accent', customAccentColor);
      root.style.setProperty('--accent-light', customAccentColor);
      root.style.setProperty('--accent-dark', customAccentColor);
    } else {
      const found = this.accentColors.find(c => c.key === accentColor);
      if (found) {
        root.style.setProperty('--accent', found.color);
        root.style.setProperty('--accent-light', found.light);
        root.style.setProperty('--accent-dark', found.dark);
      }
    }
  }
}
