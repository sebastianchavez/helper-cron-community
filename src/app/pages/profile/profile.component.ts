import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, NavigationMenuComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showUserMenu = false;
  isDarkMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translationService: TranslationService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.initializeTheme();
  }

  async loadProfile(): Promise<void> {
    try {
      const response = await window.agi?.userProfile.get();
      if (response?.success && response.data) {
        this.profileForm.patchValue({
          name: response.data.name || ''
        });
      }
    } catch (error) {
      this.showMessage(this.translationService.translate('profile.loadError'), 'error');
      console.error('Error loading profile:', error);
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      const profileData = this.profileForm.value;
      const response = await window.agi?.userProfile.save(profileData);
      
      if (response?.success) {
        this.showMessage(this.translationService.translate('profile.saveSuccess'), 'success');
        // Actualizar el servicio de usuario para reflejar el cambio inmediatamente
        this.userService.updateUser({ name: profileData.name });
      } else {
        this.showMessage(response?.error || this.translationService.translate('profile.saveError'), 'error');
      }
    } catch (error) {
      this.showMessage(this.translationService.translate('profile.saveError'), 'error');
      console.error('Error saving profile:', error);
    } finally {
      this.loading = false;
    }
  }

  async deleteProfile(): Promise<void> {
    if (!confirm(this.translationService.translate('profile.deleteConfirm'))) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      const response = await window.agi?.userProfile.delete();
      
      if (response?.success) {
        this.showMessage(this.translationService.translate('profile.deleteSuccess'), 'success');
        this.profileForm.reset();
        // Limpiar el servicio de usuario cuando se elimina el perfil
        this.userService.clearUser();
      } else {
        this.showMessage(response?.error || this.translationService.translate('profile.deleteError'), 'error');
      }
    } catch (error) {
      this.showMessage(this.translationService.translate('profile.deleteError'), 'error');
      console.error('Error deleting profile:', error);
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/chatbot']);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  // Métodos del menú de navegación
  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  navigateToProfile(): void {
    this.showUserMenu = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.showUserMenu = false;
  }

  // Métodos del menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.showUserMenu = false;
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  openAbout(): void {
    console.log('Mostrando información de la aplicación...');
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Element;
    
    // Cerrar el menú de usuario si se hace clic fuera de él
    if (this.showUserMenu && !target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }
}
