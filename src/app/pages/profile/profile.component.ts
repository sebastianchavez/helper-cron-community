import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { UserService } from '../../core/services/user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, NavigationMenuComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  loading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showUserMenu = false;
  isDarkMode = false;
  private userSubscription?: Subscription;

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
    
    // Suscribirse a los cambios del usuario para mantener sincronizado
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user?.name) {
        this.profileForm.patchValue({
          name: user.name
        }, { emitEvent: false }); // No emitir evento para evitar loops
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadProfile(): Promise<void> {
    try {
      // Primero intentar cargar desde el servicio de usuario
      const currentUser = this.userService.getCurrentUser();
      if (currentUser && currentUser.name) {
        this.profileForm.patchValue({
          name: currentUser.name
        });
        return;
      }
      
      // Si no hay datos en el servicio, cargar desde la persistencia
      const response = await window.agi?.userProfile.get();
      if (response?.success && response.data) {
        const userData = { name: response.data.name || '' };
        this.profileForm.patchValue(userData);
        // Actualizar el servicio con los datos cargados
        await this.userService.updateUser({ name: response.data.name });
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
      
      // Usar el UserService para guardar (que ahora maneja la persistencia)
      await this.userService.updateUser({ name: profileData.name });
      this.showMessage(this.translationService.translate('profile.saveSuccess'), 'success');
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
      // Usar el UserService para eliminar (que ahora maneja la persistencia)
      await this.userService.clearUser();
      this.showMessage(this.translationService.translate('profile.deleteSuccess'), 'success');
      this.profileForm.reset();
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
