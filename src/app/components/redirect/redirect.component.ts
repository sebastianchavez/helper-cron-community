import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../core/services/onboarding/onboarding.service';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar si debe mostrar onboarding
    const shouldShow = this.onboardingService.shouldShowOnboarding();
    const onboardingData = this.onboardingService.getOnboardingData();
    
    console.log('Redirect Component - Onboarding Data:', onboardingData);
    console.log('Redirect Component - Should show onboarding:', shouldShow);
    
    if (shouldShow) {
      console.log('Redirecting to welcome page...');
      this.router.navigate(['/welcome']);
    } else {
      console.log('Redirecting to chatbot page...');
      this.router.navigate(['/chatbot']);
    }
  }
}