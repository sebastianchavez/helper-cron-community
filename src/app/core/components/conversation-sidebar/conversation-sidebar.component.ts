import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FolderSidebarComponent } from '../folder-sidebar/folder-sidebar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation-sidebar',
  standalone: true,
  imports: [CommonModule, FolderSidebarComponent, TranslatePipe],
  templateUrl: './conversation-sidebar.component.html',
  styleUrls: ['./conversation-sidebar.component.scss']
})
export class ConversationSidebarComponent implements OnInit, OnDestroy {
  @Input() selectedFolderId: string | null = null;
  @Input() conversations: any[] = [];
  @Input() selectedConversationId: string | null = null;
  @Input() loading: boolean = false;
  @Input() isDragging: boolean = false;
  @Input() draggedConversationId: string | null = null;

  @Output() newConversation = new EventEmitter<void>();
  @Output() folderSelected = new EventEmitter<string | null>();
  @Output() folderCreated = new EventEmitter<void>();
  @Output() chatCreatedInFolder = new EventEmitter<string>();
  @Output() conversationMoved = new EventEmitter<{conversationId: string, folderId: string}>();
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() conversationDeleted = new EventEmitter<string>();
  @Output() dragStart = new EventEmitter<{event: DragEvent, conversationId: string}>();
  @Output() dragEnd = new EventEmitter<DragEvent>();

  userName = 'Usuario';
  userInitials = 'U';
  showUserMenu = false;

  private userSubscription?: Subscription;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user: any) => {
      if (user) {
        this.userName = user.name || 'Usuario';
        this.userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      }
    });
    this.userService.loadUserProfile();
  }

  ngOnDestroy() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  onNewConversation() { this.newConversation.emit(); }
  onFolderSelected(folderId: string | null) { this.folderSelected.emit(folderId); }
  onFolderCreated() { this.folderCreated.emit(); }
  onChatCreatedInFolder(folderId: string) { this.chatCreatedInFolder.emit(folderId); }
  onConversationMoved(event: {conversationId: string, folderId: string}) { this.conversationMoved.emit(event); }
  onConversationSelected(conversationId: string) { this.conversationSelected.emit(conversationId); }
  onConversationDeleted(conversationId: string) { this.conversationDeleted.emit(conversationId); }
  onDragStart(event: DragEvent, conversationId: string) { this.dragStart.emit({event, conversationId}); }
  onDragEnd(event: DragEvent) { this.dragEnd.emit(event); }

  getFolderConversations(): any[] {
    return this.selectedFolderId ? this.conversations.filter(c => c.isFromSelectedFolder) : [];
  }

  getRootConversations(): any[] {
    if (!this.selectedFolderId) return this.conversations;
    return this.conversations.filter(conv => !conv.isFromSelectedFolder);
  }

  trackConversation(index: number, conv: any) { return conv.id; }

  toggleUserMenu() { this.showUserMenu = !this.showUserMenu; }

  onUserMenuAction(action: string) {
    this.showUserMenu = false;
    switch (action) {
      case 'profile': this.router.navigate(['/profile']); break;
      case 'settings': this.router.navigate(['/settings']); break;
      case 'about': this.router.navigate(['/about']); break;
      case 'developer': this.router.navigate(['/developer-mode']); break;
    }
  }
}
