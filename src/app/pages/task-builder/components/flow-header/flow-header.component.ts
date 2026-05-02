import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface IconOption {
  icon: string;
  label: string;
}

interface ColorOption {
  name: string;
  iconColor: string;
  iconBg: string;
  preview: string; // tailwind bg class for the color dot
}

@Component({
  selector: 'app-flow-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './flow-header.component.html'
})
export class FlowHeaderComponent {

  // --- Inputs ---
  @Input() editingFlowId: string | null = null;
  @Input() flowName = '';
  @Input() flowIcon = 'route';
  @Input() flowIconColor = 'text-blue-600';
  @Input() flowIconBg = 'bg-blue-50 dark:bg-blue-900/30';
  @Input() isRunning = false;
  @Input() flowSaving = false;
  @Input() flowSaveSuccess = false;

  // --- Outputs ---
  @Output() run = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() nameConfirmed = new EventEmitter<string>();
  @Output() iconChanged = new EventEmitter<{ icon: string; iconColor: string; iconBg: string }>();

  // --- Internal state ---
  editingName = false;
  showIconPicker = false;
  iconSearchQuery = '';

  // --- Icon catalog ---
  readonly iconOptions: IconOption[] = [
    { icon: 'route', label: 'Route' },
    { icon: 'account_tree', label: 'Tree' },
    { icon: 'hub', label: 'Hub' },
    { icon: 'schema', label: 'Schema' },
    { icon: 'bolt', label: 'Bolt' },
    { icon: 'rocket_launch', label: 'Rocket' },
    { icon: 'terminal', label: 'Terminal' },
    { icon: 'code', label: 'Code' },
    { icon: 'cloud', label: 'Cloud' },
    { icon: 'cloud_sync', label: 'Cloud Sync' },
    { icon: 'storage', label: 'Storage' },
    { icon: 'database', label: 'Database' },
    { icon: 'api', label: 'API' },
    { icon: 'webhook', label: 'Webhook' },
    { icon: 'sync', label: 'Sync' },
    { icon: 'autorenew', label: 'Autorenew' },
    { icon: 'schedule', label: 'Schedule' },
    { icon: 'timer', label: 'Timer' },
    { icon: 'notifications', label: 'Notifications' },
    { icon: 'mail', label: 'Mail' },
    { icon: 'send', label: 'Send' },
    { icon: 'download', label: 'Download' },
    { icon: 'upload', label: 'Upload' },
    { icon: 'folder', label: 'Folder' },
    { icon: 'description', label: 'File' },
    { icon: 'table_view', label: 'Table' },
    { icon: 'analytics', label: 'Analytics' },
    { icon: 'monitoring', label: 'Monitoring' },
    { icon: 'bar_chart', label: 'Chart' },
    { icon: 'settings', label: 'Settings' },
    { icon: 'build', label: 'Build' },
    { icon: 'bug_report', label: 'Bug' },
    { icon: 'science', label: 'Science' },
    { icon: 'psychology', label: 'AI' },
    { icon: 'smart_toy', label: 'Bot' },
    { icon: 'travel_explore', label: 'Web' },
    { icon: 'language', label: 'Language' },
    { icon: 'shopping_cart', label: 'Cart' },
    { icon: 'payments', label: 'Payments' },
    { icon: 'inventory_2', label: 'Inventory' },
    { icon: 'local_shipping', label: 'Shipping' },
    { icon: 'group', label: 'Group' },
    { icon: 'person', label: 'Person' },
    { icon: 'security', label: 'Security' },
    { icon: 'vpn_key', label: 'Key' },
    { icon: 'favorite', label: 'Favorite' },
    { icon: 'star', label: 'Star' },
    { icon: 'flag', label: 'Flag' },
    { icon: 'bookmark', label: 'Bookmark' },
  ];

  readonly colorOptions: ColorOption[] = [
    { name: 'Blue',    iconColor: 'text-blue-600',    iconBg: 'bg-blue-50 dark:bg-blue-900/30',    preview: 'bg-blue-500' },
    { name: 'Indigo',  iconColor: 'text-indigo-600',  iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',preview: 'bg-indigo-500' },
    { name: 'Purple',  iconColor: 'text-purple-600',  iconBg: 'bg-purple-50 dark:bg-purple-900/30',preview: 'bg-purple-500' },
    { name: 'Pink',    iconColor: 'text-pink-600',    iconBg: 'bg-pink-50 dark:bg-pink-900/30',    preview: 'bg-pink-500' },
    { name: 'Rose',    iconColor: 'text-rose-600',    iconBg: 'bg-rose-50 dark:bg-rose-900/30',    preview: 'bg-rose-500' },
    { name: 'Red',     iconColor: 'text-red-600',     iconBg: 'bg-red-50 dark:bg-red-900/30',      preview: 'bg-red-500' },
    { name: 'Orange',  iconColor: 'text-orange-600',  iconBg: 'bg-orange-50 dark:bg-orange-900/30',preview: 'bg-orange-500' },
    { name: 'Amber',   iconColor: 'text-amber-600',   iconBg: 'bg-amber-50 dark:bg-amber-900/30',  preview: 'bg-amber-500' },
    { name: 'Emerald', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', preview: 'bg-emerald-500' },
    { name: 'Teal',    iconColor: 'text-teal-600',    iconBg: 'bg-teal-50 dark:bg-teal-900/30',    preview: 'bg-teal-500' },
    { name: 'Cyan',    iconColor: 'text-cyan-600',    iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',    preview: 'bg-cyan-500' },
    { name: 'Sky',     iconColor: 'text-sky-600',     iconBg: 'bg-sky-50 dark:bg-sky-900/30',      preview: 'bg-sky-500' },
    { name: 'Slate',   iconColor: 'text-slate-600',   iconBg: 'bg-slate-100 dark:bg-slate-800/50', preview: 'bg-slate-500' },
  ];

  constructor(private elRef: ElementRef) {}

  get filteredIcons(): IconOption[] {
    if (!this.iconSearchQuery.trim()) return this.iconOptions;
    const q = this.iconSearchQuery.toLowerCase();
    return this.iconOptions.filter(i => i.label.toLowerCase().includes(q) || i.icon.toLowerCase().includes(q));
  }

  // --- Name editing ---
  startEditName(): void {
    this.editingName = true;
  }

  confirmEditName(): void {
    this.editingName = false;
    const trimmed = this.flowName.trim();
    if (!trimmed) return;
    this.nameConfirmed.emit(trimmed);
  }

  cancelEditName(): void {
    this.editingName = false;
  }

  onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirmEditName();
    } else if (event.key === 'Escape') {
      this.cancelEditName();
    }
  }

  // --- Icon picker ---
  toggleIconPicker(): void {
    this.showIconPicker = !this.showIconPicker;
    if (this.showIconPicker) {
      this.iconSearchQuery = '';
    }
  }

  selectIcon(icon: string): void {
    this.flowIcon = icon;
    this.iconChanged.emit({ icon: this.flowIcon, iconColor: this.flowIconColor, iconBg: this.flowIconBg });
  }

  selectColor(color: ColorOption): void {
    this.flowIconColor = color.iconColor;
    this.flowIconBg = color.iconBg;
    this.iconChanged.emit({ icon: this.flowIcon, iconColor: this.flowIconColor, iconBg: this.flowIconBg });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showIconPicker && !this.elRef.nativeElement.contains(event.target)) {
      this.showIconPicker = false;
    }
  }
}
