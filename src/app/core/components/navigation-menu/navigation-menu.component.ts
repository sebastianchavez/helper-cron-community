import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UserService } from '../../services/user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="p-3 border-b border-slate-200 dark:border-slate-800 relative">
      <button
        (click)="toggleUserMenu()"
        class="flex items-center gap-3 w-full rounded-lg px-3 py-3 text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1c2433] transition-colors">
        <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-white font-bold text-xs"
          data-alt="Avatar de Usuario">
          {{ userInitials }}
        </div>
        <div class="flex flex-col items-start">
          <span class="font-medium text-xs">{{ userName }}</span>
        </div>
        <span class="material-symbols-outlined ml-auto text-slate-400 transition-transform" 
          [style.transform]="showUserMenu ? 'rotate(90deg)' : 'rotate(0deg)'" 
          style="font-size: 18px;">more_horiz</span>
      </button>

      <!-- Menú de usuario -->
      <div *ngIf="showUserMenu" 
        class="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-[#1c2433] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
        
        <!-- Volver al Chat (solo si no está en chatbot) -->
        <button 
          *ngIf="!isInChatbot"
          (click)="navigateToChat()"
          class="flex items-center gap-3 w-full px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 18px;">chat</span>
          <span>{{ 'nav.chat' | translate }}</span>
        </button>

        <!-- Mi Perfil -->
        <button 
          (click)="navigateToProfile()"
          class="flex items-center gap-3 w-full px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 18px;">person</span>
          <span>{{ 'profile.title' | translate }}</span>
        </button>

        <!-- Configuraciones -->
        <button 
          (click)="navigateToSettings()"
          class="flex items-center gap-3 w-full px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 18px;">settings</span>
          <span>{{ 'settings.title' | translate }}</span>
        </button>

        <!-- Acerca de -->
        <button 
          (click)="navigateToAbout()"
          class="flex items-center gap-3 w-full px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined" style="font-size: 18px;">info</span>
          <span>{{ 'about.title' | translate }}</span>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class NavigationMenuComponent implements OnInit, OnDestroy {
  @Input() currentPage: 'chatbot' | 'profile' | 'settings' | 'about' = 'chatbot';
  
  showUserMenu = false;
  isInChatbot = true;
  userName = 'Usuario';
  userInitials = 'U';
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isInChatbot = this.currentPage === 'chatbot';
    
    // Suscribirse a los cambios del usuario
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.userName = user?.name || this.translationService.translate('user');
      this.userInitials = this.getInitials(user?.name || this.translationService.translate('user'));
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private getInitials(name: string): string {
    if (!name || name.trim() === '') return 'U';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    // Para múltiples palabras, tomar la primera letra de las dos primeras palabras
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  navigateToChat() {
    this.router.navigate(['/chatbot']);
    this.showUserMenu = false;
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
    this.showUserMenu = false;
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
    this.showUserMenu = false;
  }
}