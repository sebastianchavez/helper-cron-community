import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavigationMenuComponent, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  appVersion: string = '';
  platform: string = '';
  electronVersion: string = '';
  nodeVersion: string = '';

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.loadVersionInfo();
  }

  private loadVersionInfo() {
    // Obtener versión de la aplicación
    this.appVersion = '2.0.0'; // Versión fija por ahora
    
    // Obtener información del sistema
    this.platform = this.getPlatformName();
    
    // Si estamos en Electron, obtener versiones específicas
    if ((window as any).versions) {
      this.electronVersion = (window as any).versions.electron || 'N/A';
      this.nodeVersion = (window as any).versions.node || 'N/A';
    } else {
      this.electronVersion = 'N/A';
      this.nodeVersion = 'N/A';
    }
  }

  private getPlatformName(): string {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('linux')) return 'Linux';
    return navigator.platform;
  }

  goBack() {
    this.router.navigate(['/chatbot']);
  }
}
