import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation/translation.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';

export interface SavedFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  blocksCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-flow-library',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, NavigationMenuComponent],
  templateUrl: './flow-library.component.html',
  styleUrls: ['./flow-library.component.scss']
})
export class FlowLibraryComponent implements OnInit {

  flows: SavedFlow[] = [];
  filteredFlows: SavedFlow[] = [];
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'recent' | 'name' = 'recent';
  filterScheduled = false;
  loading = true;

  // Rename state
  renamingFlowId: string | null = null;
  renamingFlowName = '';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private translationService: TranslationService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.loadFlows();
  }

  // ── Flows ─────────────────────────────────────────────────────────────────

  async loadFlows() {
    this.loading = true;
    try {
      const rows = await window.agi?.flow.list() ?? [];
      this.ngZone.run(() => {
        this.flows = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? '',
          icon: r.icon ?? 'route',
          iconColor: r.icon_color ?? 'text-blue-600',
          iconBg: r.icon_bg ?? 'bg-blue-50 dark:bg-blue-900/30',
          blocksCount: r.blocks_count ?? 0,
          enabled: r.enabled === 1,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        this.applyFilters();
        this.loading = false;
      });
    } catch (err) {
      this.logger.error('FLOW-LIB', 'loadFlows', { info: 'Error loading flows', error: err });
      this.ngZone.run(() => {
        this.flows = [];
        this.filteredFlows = [];
        this.loading = false;
      });
    }
  }

  applyFilters() {
    let result = [...this.flows];

    // Schedule filter
    if (this.filterScheduled) {
      result = result.filter(f => f.enabled);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.filteredFlows = result;
  }

  onSearchChange() { this.applyFilters(); }
  onSortChange() { this.applyFilters(); }

  createNewFlow() { this.router.navigate(['/task-builder']); }

  editFlow(flow: SavedFlow) {
    this.router.navigate(['/task-builder'], { queryParams: { flowId: flow.id } });
  }

  async duplicateFlow(flow: SavedFlow, event: MouseEvent) {
    event.stopPropagation();
    try {
      await window.agi?.flow.duplicate(flow.id);
      await this.loadFlows();
    } catch (err) {
      this.logger.error('FLOW-LIB', 'duplicateFlow', { info: 'Error duplicating flow', error: err });
    }
  }

  startRename(flow: SavedFlow, event: MouseEvent) {
    event.stopPropagation();
    this.renamingFlowId = flow.id;
    this.renamingFlowName = flow.name;
  }

  async confirmRename() {
    const trimmed = this.renamingFlowName.trim();
    if (!trimmed || !this.renamingFlowId) { this.cancelRename(); return; }
    try {
      await window.agi?.flow.update(this.renamingFlowId, { name: trimmed });
      const flow = this.flows.find(f => f.id === this.renamingFlowId);
      if (flow) { flow.name = trimmed; this.applyFilters(); }
    } catch (err) {
      this.logger.error('FLOW-LIB', 'confirmRename', { info: 'Error renaming flow', error: err });
    } finally {
      this.renamingFlowId = null;
      this.renamingFlowName = '';
    }
  }

  cancelRename() { this.renamingFlowId = null; this.renamingFlowName = ''; }

  onRenameKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.confirmRename();
    else if (event.key === 'Escape') this.cancelRename();
  }

  async deleteFlow(flow: SavedFlow, event: MouseEvent) {
    event.stopPropagation();
    try {
      await window.agi?.flow.delete(flow.id);
      await this.loadFlows();
    } catch (err) {
      this.logger.error('FLOW-LIB', 'deleteFlow', { info: 'Error deleting flow', error: err });
    }
  }

  toggleScheduleFilter() { this.filterScheduled = !this.filterScheduled; this.applyFilters(); }

  // ── Utils ─────────────────────────────────────────────────────────────────

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);
    const months = Math.floor(diff / 2592000000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return '1d';
    if (days < 7) return `${days}d`;
    if (weeks === 1) return '1w';
    if (weeks < 4) return `${weeks}w`;
    return `${months}mo`;
  }
}
