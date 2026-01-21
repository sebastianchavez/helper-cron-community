import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface UserProfile {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadUserProfile();
  }

  async loadUserProfile(): Promise<void> {
    try {
      const response = await window.agi?.userProfile.get();
      if (response?.success && response.data) {
        this.userSubject.next({ name: response.data.name });
      } else {
        this.userSubject.next(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userSubject.next(null);
    }
  }

  getUserName(): string {
    const user = this.userSubject.value;
    return user?.name || 'Usuario';
  }

  getCurrentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  updateUser(user: UserProfile): void {
    this.userSubject.next(user);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}