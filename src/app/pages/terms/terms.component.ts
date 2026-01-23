import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent implements OnInit {
  public currentDate: string;

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {
    this.currentDate = this.getCurrentDate();
  }

  ngOnInit(): void {}

  navigateBack(): void {
    this.router.navigate(['/settings']);
  }

  navigateToHome(): void {
    this.router.navigate(['/chatbot']);
  }

  private getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.navigateBack();
  }
}