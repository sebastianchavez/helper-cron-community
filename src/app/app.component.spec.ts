import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslationService } from './core/services/translation/translation.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let translationSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    translationSpy = jasmine.createSpyObj('TranslationService', ['setLanguage', 'translate', 'loadLanguage'], {
      currentLanguage$: new BehaviorSubject('es'),
      languageLoaded$: new BehaviorSubject(0),
      availableLanguages: []
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title property set to electron-chatbot-ia-app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('electron-chatbot-ia-app');
  });

  it('should render a router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should call setLanguage on construction', () => {
    TestBed.createComponent(AppComponent);
    expect(translationSpy.setLanguage).toHaveBeenCalled();
  });

  it('should use saved language from localStorage if present', () => {
    localStorage.setItem('app-language', 'en');
    TestBed.createComponent(AppComponent);
    expect(translationSpy.setLanguage).toHaveBeenCalledWith('en');
    localStorage.removeItem('app-language');
  });

  it('should default to "es" when no language is in localStorage', () => {
    localStorage.removeItem('app-language');
    TestBed.createComponent(AppComponent);
    expect(translationSpy.setLanguage).toHaveBeenCalledWith('es');
  });
});
