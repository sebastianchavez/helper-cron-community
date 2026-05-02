import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../core/services/onboarding/onboarding.service';
import { LoggerService } from '../../core/services/logger/logger.service';

@Component({
  selector: 'app-redirect',
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  `,
  styles: []
})
export class RedirectComponent implements OnInit {

  constructor(
    private onboardingService: OnboardingService,
    private router: Router,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // Verificar si debe mostrar onboarding
    const shouldShow = this.onboardingService.shouldShowOnboarding();
    const onboardingData = this.onboardingService.getOnboardingData();
    
    this.logger.log('REDIRECT', 'ngOnInit', { info: 'Onboarding Data', response: onboardingData });
    this.logger.log('REDIRECT', 'ngOnInit', { info: 'Should show onboarding', response: shouldShow });
    
    if (shouldShow) {
      this.logger.log('REDIRECT', 'ngOnInit', { info: 'Redirecting to welcome page' });
      this.router.navigate(['/welcome']);
    } else {
      this.logger.log('REDIRECT', 'ngOnInit', { info: 'Redirecting to dashboard page' });
      this.router.navigate(['/dashboard']);
    }
  }
}