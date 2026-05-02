import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
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
    <aside
      class="flex-shrink-0 bg-sidebar-light dark:bg-sidebar-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden"
      [style.width.px]="collapsed ? 56 : 220">

      <nav class="flex flex-col h-full py-3" [class.items-center]="collapsed" [class.px-3]="!collapsed">

        <!-- Toggle button -->
        <button
          (click)="toggleCollapse($event)"
          class="mb-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          [class.w-10]="collapsed" [class.h-10]="collapsed" [class.mx-auto]="collapsed"
          [class.w-full]="!collapsed" [class.h-9]="!collapsed" [class.px-2]="!collapsed">
          <span class="material-symbols-outlined" style="font-size: 20px;">
            {{ collapsed ? 'menu' : 'menu_open' }}
          </span>
          <span *ngIf="!collapsed" class="ml-3 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {{ 'nav.collapse' | translate }}
          </span>
        </button>

        <div class="w-full h-px bg-slate-200 dark:bg-slate-700 mb-2" [class.mx-auto]="collapsed" [style.width]="collapsed ? '24px' : '100%'"></div>

        <!-- Main navigation -->
        <div class="flex flex-col gap-1" [class.items-center]="collapsed">

          <!-- Dashboard -->
          <button
            (click)="navigateTo('/dashboard')"
            [class]="getNavClass('dashboard')"
            [title]="collapsed ? ('nav.dashboard' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">dashboard</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'nav.dashboard' | translate }}</span>
          </button>

          <div class="h-px bg-slate-200 dark:bg-slate-700 my-1" [style.width]="collapsed ? '24px' : '100%'"></div>

          <!-- Flow Library -->
          <button
            (click)="navigateTo('/flow-library')"
            [class]="getNavClass('flow-library')"
            [title]="collapsed ? ('nav.taskBuilder' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">account_tree</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'nav.taskBuilder' | translate }}</span>
          </button>

          <div class="h-px bg-slate-200 dark:bg-slate-700 my-1" [style.width]="collapsed ? '24px' : '100%'"></div>

          <!-- Chat -->
          <button
            (click)="navigateTo('/chatbot')"
            [class]="getNavClass('chatbot')"
            [title]="collapsed ? ('nav.chat' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">chat</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'nav.chat' | translate }}</span>
          </button>

          <!-- AI Models -->
          <button
            (click)="navigateTo('/ai-models')"
            [class]="getNavClass('ai-models')"
            [title]="collapsed ? ('models.title' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">smart_toy</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'models.title' | translate }}</span>
          </button>

          <div class="h-px bg-slate-200 dark:bg-slate-700 my-1" [style.width]="collapsed ? '24px' : '100%'"></div>

          <!-- Settings -->
          <button
            (click)="navigateTo('/settings')"
            [class]="getNavClass('settings')"
            [title]="collapsed ? ('nav.settings' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">settings</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'nav.settings' | translate }}</span>
          </button>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Bottom section -->
        <div class="flex flex-col gap-1" [class.items-center]="collapsed">
          <!-- About -->
          <button
            (click)="navigateTo('/about')"
            [class]="getNavClass('about')"
            [title]="collapsed ? ('nav.about' | translate) : ''">
            <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px;">info</span>
            <span *ngIf="!collapsed" class="ml-3 text-sm font-medium truncate">{{ 'nav.about' | translate }}</span>
          </button>

          <div class="h-px bg-slate-200 dark:bg-slate-700 my-1" [style.width]="collapsed ? '24px' : '100%'"></div>

          <!-- User section -->
          <div class="relative" [class.w-full]="!collapsed">
            <button
              (click)="toggleUserMenu($event)"
              [class]="collapsed
                ? 'relative w-9 h-9 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-white font-bold text-xs hover:ring-2 hover:ring-primary/30 transition-colors cursor-pointer'
                : 'relative w-full h-10 rounded-xl flex items-center px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'"
              [title]="collapsed ? userName : ''">
              <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {{ userInitials }}
              </span>
              <span *ngIf="!collapsed" class="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ userName }}</span>
              <span *ngIf="!collapsed" class="material-symbols-outlined ml-auto text-slate-400 flex-shrink-0" style="font-size: 16px;">
                {{ showUserMenu ? 'expand_less' : 'expand_more' }}
              </span>
            </button>

            <!-- User dropdown -->
            <div *ngIf="showUserMenu"
              class="absolute z-50 bg-white dark:bg-[#1c2433] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1"
              [ngClass]="collapsed
                ? 'bottom-0 left-full ml-2 min-w-[180px]'
                : 'bottom-full left-0 mb-2 w-full'">
              <button
                (click)="navigateTo('/profile')"
                class="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined" style="font-size: 16px;">person</span>
                <span>{{ 'nav.profile' | translate }}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Navigation blocked toast -->
    <div *ngIf="navBlocked"
      class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white text-xs font-medium rounded-xl shadow-xl pointer-events-none">
      <span class="material-symbols-outlined" style="font-size: 15px;">block</span>
      {{ 'nav.flowRunningCannotNavigate' | translate }}
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class NavigationMenuComponent implements OnInit, OnDestroy {
  @Input() currentPage: 'dashboard' | 'chatbot' | 'profile' | 'settings' | 'about' | 'task-builder' | 'flow-library' | 'ai-models' = 'dashboard';
  @Input() isFlowRunning = false;
  
  collapsed = true;
  showUserMenu = false;
  navBlocked = false;
  private navBlockedTimer?: ReturnType<typeof setTimeout>;
  userName = 'Usuario';
  userInitials = 'U';
  private userSubscription?: Subscription;

  private readonly STORAGE_KEY = 'nav-collapsed';

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.collapsed = stored !== 'false';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showUserMenu && !this.elementRef.nativeElement.contains(event.target)) {
      this.showUserMenu = false;
    }
  }

  ngOnInit() {
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
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  }

  getNavClass(page: string): string {
    const baseCollapsed = 'w-10 h-10 rounded-xl flex items-center justify-center transition-colors';
    const baseExpanded = 'w-full h-10 rounded-xl flex items-center px-3 transition-colors';
    const base = this.collapsed ? baseCollapsed : baseExpanded;

    if (this.currentPage === page) {
      return `${base} bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary`;
    }
    return `${base} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200`;
  }

  toggleCollapse(event: MouseEvent) {
    event.stopPropagation();
    this.collapsed = !this.collapsed;
    localStorage.setItem(this.STORAGE_KEY, String(this.collapsed));
    if (this.collapsed) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  navigateTo(path: string) {
    if (this.isFlowRunning) {
      this.navBlocked = true;
      clearTimeout(this.navBlockedTimer);
      this.navBlockedTimer = setTimeout(() => { this.navBlocked = false; }, 2500);
      return;
    }
    this.router.navigate([path]);
    this.showUserMenu = false;
  }

  // Keep legacy methods for backward compatibility
  navigateToChat() { this.navigateTo('/chatbot'); }
  navigateToProfile() { this.navigateTo('/profile'); }
  navigateToSettings() { this.navigateTo('/settings'); }
  navigateToAbout() { this.navigateTo('/about'); }
  toggleUserMenu2() { this.showUserMenu = !this.showUserMenu; }
}
