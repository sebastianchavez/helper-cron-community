import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'electron-chatbot-ia-app';

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
}
