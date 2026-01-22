import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  dontShowAgain: boolean;
  userName?: string;
  completedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly STORAGE_KEY = 'localmind_onboarding';
  
  private onboardingDataSubject = new BehaviorSubject<OnboardingData>(this.loadOnboardingData());
  public onboardingData$ = this.onboardingDataSubject.asObservable();

  constructor() {}

  private loadOnboardingData(): OnboardingData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convertir fecha si existe
        if (data.completedAt) {
          data.completedAt = new Date(data.completedAt);
        }
        return data;
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
    
    return {
      hasCompletedOnboarding: false,
      dontShowAgain: false
    };
  }

  private saveOnboardingData(data: OnboardingData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.onboardingDataSubject.next(data);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  }

  shouldShowOnboarding(): boolean {
    const data = this.onboardingDataSubject.value;
    return !data.hasCompletedOnboarding && !data.dontShowAgain;
  }

  completeOnboarding(userName: string, dontShowAgain: boolean): void {
    const data: OnboardingData = {
      hasCompletedOnboarding: true,
      dontShowAgain: dontShowAgain,
      userName: userName,
      completedAt: new Date()
    };
    
    this.saveOnboardingData(data);
  }

  resetOnboarding(): void {
    const data: OnboardingData = {
      hasCompletedOnboarding: false,
      dontShowAgain: false
    };
    
    this.saveOnboardingData(data);
  }

  getOnboardingData(): OnboardingData {
    return this.onboardingDataSubject.value;
  }
}