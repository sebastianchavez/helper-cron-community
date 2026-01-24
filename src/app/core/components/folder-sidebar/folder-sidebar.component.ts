import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgxSimpliAlertService } from 'ngx-simpli-alert';
import { FolderService, FolderWithChildren } from '../../services/folder/folder.service';
import { FolderTreeItemComponent } from './folder-tree-item.component';
import { TranslationService } from '../../services/translation/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'app-folder-sidebar',
  standalone: true,
  imports: [CommonModule, FolderTreeItemComponent, TranslatePipe],
  template: `
    <div class="flex flex-col gap-2">
      <button (click)="(!loading && !isStreaming) && openCreateFolderDialog()"
        [class.opacity-50]="loading || isStreaming"
        [class.cursor-not-allowed]="loading || isStreaming"
        [class.cursor-pointer]="!loading && !isStreaming"
        class="flex w-full items-center justify-start rounded-lg h-9 px-3 hover:bg-slate-100 dark:hover:bg-[#1c2433] text-xs font-medium transition-colors gap-2 text-slate-600 dark:text-slate-400 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
        <span class="material-symbols-outlined group-hover:text-primary transition-colors"
          style="font-size: 20px;">create_new_folder</span>
        <span>{{ 'folders.newFolder' | translate }}</span>
      </button>

      <div *ngIf="folders.length > 0" class="flex flex-col gap-1 mt-2">
        <div *ngFor="let folder of folders" class="flex flex-col">
          <div (click)="(!loading && !isStreaming) && selectAndToggleFolder(folder.id)" 
            (drop)="onDrop($event, folder.id)"
            (dragover)="onDragOver($event)"
            (dragenter)="onDragEnter($event, folder.id)"
            (dragleave)="onDragLeave($event)"
            [ngClass]="{
              'bg-blue-100 dark:bg-blue-900/20': dragOverFolderId === folder.id,
              'bg-slate-200 dark:bg-slate-700': selectedFolderId === folder.id,
              'opacity-50': loading || isStreaming,
              'cursor-not-allowed': loading || isStreaming,
              'cursor-pointer': !loading && !isStreaming
            }"
            class="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c2433] transition-colors group">
            <span class="material-symbols-outlined text-[16px] transition-transform" 
              [style.transform]="getRotationStyle(folder.id)"
              style="font-size: 16px;">chevron_right</span>
            <span class="material-symbols-outlined text-[16px]" style="font-size: 16px;">folder</span>
            <span class="truncate flex-1">{{ folder.name }}</span>
            <span class="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{{ folder.conversation_count || 0 }}</span>
            
            <button (click)="(!loading && !isStreaming) && createChatInFolder($event, folder.id)"
              [disabled]="loading || isStreaming"
              class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded mr-1 disabled:opacity-25">
              <span class="material-symbols-outlined text-[14px] text-green-600" style="font-size: 14px;">add</span>
            </button>
            
            <button (click)="(!loading && !isStreaming) && openDeleteFolderDialog($event, folder.id)" 
              [disabled]="loading || isStreaming"
              class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-25">
              <span class="material-symbols-outlined text-[14px] text-red-600" style="font-size: 14px;">delete</span>
            </button>
          </div>

          <div *ngIf="expandedFolders.has(folder.id) && folder.children && folder.children.length > 0" 
            class="ml-4 flex flex-col gap-1">
            <app-folder-tree-item 
              *ngFor="let child of folder.children"
              [folder]="child"
              [expandedFolders]="expandedFolders"
              [selectedFolderId]="selectedFolderId"
              [loading]="loading"
              [isStreaming]="isStreaming"
              [level]="1"
              (toggleFolder)="toggleFolder($event)"
              (deleteFolder)="deleteFolderHandler($event)"
              (conversationMoved)="conversationMoved.emit($event)"
              (chatCreated)="chatCreatedInFolder.emit($event)"
              (folderSelected)="folderSelected.emit($event)">
            </app-folder-tree-item>
          </div>

          <!-- Mostrar conversaciones de la carpeta seleccionada -->
          <div *ngIf="selectedFolderId === folder.id && conversations.length > 0" 
            class="w-full pt-2">
            <div *ngFor="let conv of conversations; trackBy: trackConversation" 
              (click)="(!loading && !isStreaming) && conversationSelected.emit(conv.id)"
              [class.bg-slate-200]="conv.id === selectedConversationId"
              [class.dark:bg-slate-700]="conv.id === selectedConversationId"
              [class.opacity-50]="loading || isStreaming"
              [class.cursor-not-allowed]="loading || isStreaming"
              [class.cursor-pointer]="!loading && !isStreaming"
              class="group pl-10 flex items-center w-full py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c2433] transition-colors">
              <span class="truncate">{{ conv.title || ('conversation' | translate) }}</span>
              <button (click)="deleteConversation($event, conv.id)" [disabled]="loading || isStreaming"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 ml-auto">
                <span class="material-symbols-outlined text-[12px]" style="font-size: 12px;">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="folders.length === 0" class="text-xs text-slate-400 py-4 text-center">
        {{ 'folders.noFolders' | translate }}
      </div>
    </div>

    <!-- Modal crear carpeta -->
    <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-[#1c2433] rounded-lg p-6 w-96 shadow-lg">
        <h3 class="text-lg font-bold mb-4 dark:text-white">{{ 'folders.newFolder' | translate }}</h3>
        <input 
          #folderNameInput
          type="text" 
          placeholder="{{ 'folders.folderName' | translate }}"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-[#0d1117] dark:text-white mb-4"
          (keyup.enter)="createFolder()"
          (keyup.escape)="cancelCreateModal()">
        <div class="flex gap-2 justify-end">
          <button (click)="cancelCreateModal()"
            class="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600">
            {{ 'common.cancel' | translate }}
          </button>
          <button (click)="createFolder()"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80">
            {{ 'folders.create' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FolderSidebarComponent implements OnInit {
  @Input() selectedFolderId: string | null = null;
  @Input() conversations: any[] = [];
  @Input() selectedConversationId: string | null = null;
  @Input() loading: boolean = false;
  @Input() isStreaming: boolean = false;
  @Output() folderSelected = new EventEmitter<string | null>();
  @Output() folderCreated = new EventEmitter<void>();
  @Output() chatCreatedInFolder = new EventEmitter<string>();
  @Output() conversationMoved = new EventEmitter<{conversationId: string, folderId: string}>();
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() conversationDeleted = new EventEmitter<string>();

  folders: FolderWithChildren[] = [];
  expandedFolders = new Set<string>();
  showCreateModal = false;
  newFolderName = '';
  dragOverFolderId: string | null = null;

  constructor(private folderService: FolderService, private translationService: TranslationService, private logger: LoggerService, private alertService: NgxSimpliAlertService) {}

  ngOnInit() {
    this.folderService.folders$.subscribe((folders: FolderWithChildren[]) => {
      this.folders = folders;
    });
    this.loadFolders();
  }

  async loadFolders() {
    await this.folderService.loadFoldersWithCount();
  }

  toggleFolder(folderId: string) {
    if (this.expandedFolders.has(folderId)) {
      this.expandedFolders.delete(folderId);
    } else {
      this.expandedFolders.add(folderId);
    }
  }

  selectAndToggleFolder(folderId: string) {
    // Si la carpeta ya está seleccionada, deseleccionarla
    if (this.selectedFolderId === folderId) {
      this.folderSelected.emit(null); // Volver a mostrar todos los chats
    } else {
      // Seleccionar la carpeta para mostrar sus conversaciones
      this.folderSelected.emit(folderId);
    }
    
    // También expandir/contraer la carpeta
    this.toggleFolder(folderId);
  }

  openCreateFolderDialog() {
    this.showCreateModal = true;
    setTimeout(() => {
      const input = document.querySelector('input[placeholder]') as HTMLInputElement;
      if (input) input.focus();
    });
  }

  cancelCreateModal() {
    this.showCreateModal = false;
    this.newFolderName = '';
  }

  async createFolder() {
    const input = document.querySelector('input[placeholder]') as HTMLInputElement;
    const name = input?.value?.trim();
    
    if (!name) return;

    await this.folderService.createFolder(name);
    this.showCreateModal = false;
    this.newFolderName = '';
    this.folderCreated.emit();
  }

  openDeleteFolderDialog(event: MouseEvent, folderId: string) {
    event.stopPropagation();
    this.alertService.show({
      title: this.translationService.translate('folders.deleteTitle'),
      description: this.translationService.translate('folders.deleteConfirm'),
      type: 'question',
      confirmButtonText: this.translationService.translate('common.delete'),
      cancelButtonText: this.translationService.translate('common.cancel')
    }, 
    () => {
      this.folderService.deleteFolder(folderId);
    });
  }

  getRotationStyle(folderId: string): string {
    return `rotate(${this.expandedFolders.has(folderId) ? 90 : 0}deg)`;
  }

  deleteFolderHandler(folderId: string) {
    this.alertService.show({
      title: this.translationService.translate('folders.deleteTitle'),
      description: this.translationService.translate('folders.deleteConfirm'),
      type: 'question',
      confirmButtonText: this.translationService.translate('common.delete'),
      cancelButtonText: this.translationService.translate('common.cancel')
    }, 
    () => {
      this.folderService.deleteFolder(folderId);
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent, folderId: string) {
    event.preventDefault();
    this.dragOverFolderId = folderId;
  }

  onDragLeave(event: DragEvent) {
    // Solo resetear si realmente salimos del elemento
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverFolderId = null;
    }
  }

  onDrop(event: DragEvent, folderId: string) {
    event.preventDefault();
    this.dragOverFolderId = null;
    
    const conversationId = event.dataTransfer?.getData('text/plain');
    this.logger.log('FOLDER_SIDEBAR', 'onDrop', { info: 'Drop event', response: { conversationId, folderId } });
    
    if (conversationId) {
      this.conversationMoved.emit({conversationId, folderId});
    }
  }

  createChatInFolder(event: MouseEvent, folderId: string) {
    event.stopPropagation();
    this.chatCreatedInFolder.emit(folderId);
  }

  trackConversation(index: number, conv: any) {
    return conv.id;
  }

  deleteConversation(event: MouseEvent, conversationId: string) {
    event.stopPropagation();
    this.conversationDeleted.emit(conversationId);
  }
}
