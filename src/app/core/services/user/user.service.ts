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

  async updateUser(user: UserProfile): Promise<void> {
    try {
      // Persistir los datos usando el API de Electron
      const response = await window.agi?.userProfile.save(user);
      if (response?.success) {
        this.userSubject.next(user);
      } else {
        console.error('Error updating user:', response?.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // Aunque falle la persistencia, actualizamos el estado local
      this.userSubject.next(user);
    }
  }

  async clearUser(): Promise<void> {
    try {
      const response = await window.agi?.userProfile.delete();
      if (response?.success) {
        this.userSubject.next(null);
      } else {
        console.error('Error clearing user:', response?.error);
      }
    } catch (error) {
      console.error('Error clearing user:', error);
      this.userSubject.next(null);
    }
  }
}