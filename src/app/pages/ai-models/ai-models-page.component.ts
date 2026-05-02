import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { AiModelsComponent } from '../../core/components/ai-models/ai-models.component';

@Component({
  selector: 'app-ai-models-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NavigationMenuComponent, AiModelsComponent],
  templateUrl: './ai-models-page.component.html',
  styleUrls: ['./ai-models-page.component.scss']
})
export class AiModelsPageComponent {

  loading = false;

  constructor(private router: Router) {}

  navigateBack(): void {
    this.router.navigate(['/settings']);
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }
}
