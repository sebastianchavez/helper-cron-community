import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('es');
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: { [key: string]: string } } = {};
  private loadedLanguages = new Set<string>();
  private loadingPromises: { [lang: string]: Promise<void> | undefined } = {};

  /** Emits whenever a language file finishes loading (triggers pipe refresh) */
  private languageLoadedSubject = new BehaviorSubject<number>(0);
  public languageLoaded$: Observable<number> = this.languageLoadedSubject.asObservable();

  public availableLanguages: Language[] = [
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'pt', name: 'Português', nativeName: 'Português' },
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];

  constructor() {
    const savedLanguage = localStorage.getItem('app-language');
    const initialLang = savedLanguage && this.availableLanguages.some(l => l.code === savedLanguage)
      ? savedLanguage
      : 'es';

    this.currentLanguageSubject.next(initialLang);
    this.loadLanguage(initialLang);
  }

  /**
   * Loads a language JSON file from assets/i18n/{lang}.json.
   * Returns a promise that resolves when the language is ready.
   */
  loadLanguage(lang: string): Promise<void> {
    if (this.loadedLanguages.has(lang)) {
      return Promise.resolve();
    }
    if (this.loadingPromises[lang]) {
      return this.loadingPromises[lang];
    }

    this.loadingPromises[lang] = fetch(`assets/i18n/${lang}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${lang}: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { [key: string]: string }) => {
        this.translations[lang] = data;
        this.loadedLanguages.add(lang);
        delete this.loadingPromises[lang];
        // Notify pipes/subscribers that new translations are available
        this.languageLoadedSubject.next(this.languageLoadedSubject.value + 1);
      })
      .catch(err => {
        console.error(`Error loading language "${lang}":`, err);
        delete this.loadingPromises[lang];
      });

    return this.loadingPromises[lang] ?? Promise.resolve();
  }

  async setLanguage(languageCode: string): Promise<void> {
    if (!this.availableLanguages.some(l => l.code === languageCode)) return;

    await this.loadLanguage(languageCode);
    this.currentLanguageSubject.next(languageCode);
    localStorage.setItem('app-language', languageCode);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    const translation = this.translations[currentLang]?.[key];
    if (translation) return translation;

    // Fallback to 'es' if available
    const fallback = this.translations['es']?.[key];
    return fallback || key;
  }

  getLanguageName(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }
}
