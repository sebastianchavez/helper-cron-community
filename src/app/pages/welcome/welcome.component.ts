import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation/translation.service';
import { OnboardingService } from '../../core/services/onboarding/onboarding.service';
import { UserService } from '../../core/services/user/user.service';
import { LoggerService } from '../../core/services/logger/logger.service';

interface WelcomeSlide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  gradient: string;
}

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentSlideIndex = 0;
  userName = '';
  dontShowAgain = false;
  isSubmitting = false;

  slides: WelcomeSlide[] = [
    {
      id: 'aiChat',
      titleKey: 'welcome.aiChatTitle',
      descriptionKey: 'welcome.aiChatDesc',
      icon: 'psychology',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'offline',
      titleKey: 'welcome.offlineTitle',
      descriptionKey: 'welcome.offlineDesc',
      icon: 'offline_bolt',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      id: 'organize',
      titleKey: 'welcome.organizeTitle',
      descriptionKey: 'welcome.organizeDesc',
      icon: 'folder_managed',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'privacy',
      titleKey: 'welcome.privacyTitle',
      descriptionKey: 'welcome.privacyDesc',
      icon: 'shield',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'multilang',
      titleKey: 'welcome.multilangTitle',
      descriptionKey: 'welcome.multilangDesc',
      icon: 'language',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private onboardingService: OnboardingService,
    private userService: UserService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    // Verificar si debería mostrar onboarding
    if (!this.onboardingService.shouldShowOnboarding()) {
      this.navigateToChat();
      return;
    }
  }

  ngOnDestroy(): void {}

  nextSlide(): void {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex++;
    }
  }

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  get isFirstSlide(): boolean {
    return this.currentSlideIndex === 0;
  }

  get isLastSlide(): boolean {
    return this.currentSlideIndex === this.slides.length - 1;
  }

  get currentSlide(): WelcomeSlide {
    return this.slides[this.currentSlideIndex];
  }

  get isFormValid(): boolean {
    return this.userName.trim().length >= 2;
  }

  async completeOnboarding(): Promise<void> {
    if (!this.isFormValid) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Guardar nombre de usuario en el servicio de usuario
      if (this.userName.trim()) {
        await this.userService.updateUser({ name: this.userName.trim() });
      }

      // Marcar onboarding como completado
      this.onboardingService.completeOnboarding(this.userName.trim(), this.dontShowAgain);

      // Esperar un momento para mostrar el estado de carga
      setTimeout(() => {
        this.navigateToChat();
      }, 500);

    } catch (error) {
      this.logger.error('WELCOME', 'completeOnboarding', { info: 'Error completing onboarding', error });
      this.isSubmitting = false;
    }
  }

  private navigateToChat(): void {
    this.router.navigate(['/chatbot']);
  }

  skipOnboarding(): void {
    this.navigateToChat();
  }
}