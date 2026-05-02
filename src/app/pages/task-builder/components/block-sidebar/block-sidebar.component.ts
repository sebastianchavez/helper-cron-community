import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { BlockTemplate } from '../../task-builder.component';

export interface BlockCategory {
  key: string;
  labelKey: string;
  blocks: BlockTemplate[];
}

@Component({
  selector: 'app-block-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './block-sidebar.component.html',
  host: { class: 'flex flex-col h-full overflow-hidden' },
})
export class BlockSidebarComponent implements OnInit {
  @Input() blockCategories: BlockCategory[] = [];
  @Output() templateDragStart = new EventEmitter<{ event: DragEvent; template: BlockTemplate }>();

  searchQuery = '';
  collapsedCategories: { [key: string]: boolean } = {};

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {}

  getFilteredCategories(): BlockCategory[] {
    const categories = !this.searchQuery.trim()
      ? this.blockCategories
      : this.blockCategories
          .map(cat => ({
            ...cat,
            blocks: cat.blocks.filter(b =>
              this.translationService.translate(b.labelKey).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
              this.translationService.translate(b.descKey).toLowerCase().includes(this.searchQuery.toLowerCase())
            )
          }))
          .filter(cat => cat.blocks.length > 0);

    return categories;
  }

  toggleCategory(key: string): void {
    this.collapsedCategories[key] = !this.collapsedCategories[key];
  }

  isCategoryCollapsed(key: string): boolean {
    return !!this.collapsedCategories[key];
  }

  onDragStart(event: DragEvent, template: BlockTemplate): void {
    this.templateDragStart.emit({ event, template });
  }
}
