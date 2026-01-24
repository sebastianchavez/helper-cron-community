import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FolderWithChildren } from '../../services/folder/folder.service';

@Component({
  selector: 'app-folder-tree-item',
  standalone: true,
  imports: [CommonModule, forwardRef(() => FolderTreeItemComponent)],
  template: `
    <div (click)="(!loading && !isStreaming) && selectAndToggle()" 
      (drop)="onDrop($event)"
      (dragover)="onDragOver($event)"
      (dragenter)="onDragEnter($event)"
      (dragleave)="onDragLeave($event)"
      [ngClass]="{
        'bg-blue-100 dark:bg-blue-900/20': dragOverThis,
        'bg-slate-200 dark:bg-slate-700': isSelected,
        'opacity-50': loading || isStreaming,
        'cursor-not-allowed': loading || isStreaming,
        'cursor-pointer': !loading && !isStreaming
      }"
      class="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c2433] transition-colors group"
      [style.marginLeft]="getMarginLeft()">
      <span class="material-symbols-outlined text-[16px] transition-transform" 
        [style.transform]="getRotationStyle()"
        style="font-size: 16px;">chevron_right</span>
      <span class="material-symbols-outlined text-[16px]" style="font-size: 16px;">folder</span>
      <span class="truncate flex-1">{{ folder.name }}</span>
      <span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{{ folder.conversation_count || 0 }}</span>
      
      <button (click)="(!loading && !isStreaming) && createChatHere($event)"
        [disabled]="loading || isStreaming"
        class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded mr-1 disabled:opacity-25">
        <span class="material-symbols-outlined text-[14px] text-green-600" style="font-size: 14px;">add</span>
      </button>
      
      <button (click)="(!loading && !isStreaming) && delete($event)" 
        [disabled]="loading || isStreaming"
        class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-25">
        <span class="material-symbols-outlined text-[14px] text-red-600" style="font-size: 14px;">delete</span>
      </button>
    </div>

    <div *ngIf="isExpanded && folder.children && folder.children.length > 0" 
      class="flex flex-col gap-1">
      <app-folder-tree-item 
        *ngFor="let child of folder.children"
        [folder]="child"
        [expandedFolders]="expandedFolders"
        [selectedFolderId]="selectedFolderId"
        [loading]="loading"
        [isStreaming]="isStreaming"
        [level]="level + 1"
        (toggleFolder)="toggleFolder.emit($event)"
        (deleteFolder)="deleteFolder.emit($event)"
        (conversationMoved)="conversationMoved.emit($event)"
        (chatCreated)="chatCreated.emit($event)"
        (folderSelected)="folderSelected.emit($event)">
      </app-folder-tree-item>
    </div>
  `,
  styles: []
})
export class FolderTreeItemComponent {
  @Input() folder!: FolderWithChildren;
  @Input() expandedFolders!: Set<string>;
  @Input() selectedFolderId: string | null = null;
  @Input() loading: boolean = false;
  @Input() isStreaming: boolean = false;
  @Input() level = 0;
  @Output() toggleFolder = new EventEmitter<string>();
  @Output() deleteFolder = new EventEmitter<string>();
  @Output() conversationMoved = new EventEmitter<{conversationId: string, folderId: string}>();
  @Output() chatCreated = new EventEmitter<string>();
  @Output() folderSelected = new EventEmitter<string | null>();

  dragOverThis = false;

  get isExpanded() {
    return this.expandedFolders.has(this.folder.id);
  }

  get isSelected() {
    return this.selectedFolderId === this.folder.id;
  }

  toggle() {
    this.toggleFolder.emit(this.folder.id);
  }

  selectAndToggle() {
    // Si la carpeta ya está seleccionada, deseleccionarla
    if (this.isSelected) {
      this.folderSelected.emit(null); // Volver a mostrar todos los chats
    } else {
      // Seleccionar la carpeta para mostrar sus conversaciones
      this.folderSelected.emit(this.folder.id);
    }
    
    // También expandir/contraer la carpeta
    this.toggle();
  }

  delete(event: MouseEvent) {
    event.stopPropagation();
    this.deleteFolder.emit(this.folder.id);
  }

  getRotationStyle(): string {
    return `rotate(${this.isExpanded ? 90 : 0}deg)`;
  }

  getMarginLeft(): string {
    return `${this.level * 16}px`;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.dragOverThis = true;
  }

  onDragLeave(event: DragEvent) {
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverThis = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOverThis = false;
    
    const conversationId = event.dataTransfer?.getData('text/plain');
    if (conversationId) {
      this.conversationMoved.emit({conversationId, folderId: this.folder.id});
    }
  }

  createChatHere(event: MouseEvent) {
    event.stopPropagation();
    this.chatCreated.emit(this.folder.id);
  }
}
