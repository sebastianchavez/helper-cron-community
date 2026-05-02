import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { LoggerService } from '../../core/services/logger/logger.service';

interface StatCard {
  labelKey: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
  route?: string;
}

interface RecentExecution {
  id: string;
  flowName: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  duration?: number;
}

interface QuickAction {
  labelKey: string;
  descKey: string;
  icon: string;
  color: string;
  bgColor: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NavigationMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = true;

  totalFlows = 0;
  activeFlows = 0;
  totalConversations = 0;
  availableModels = 0;

  recentExecutions: RecentExecution[] = [];
  recentFlows: { id: string; name: string; icon: string; iconColor: string; iconBg: string; updatedAt: string }[] = [];

  quickActions: QuickAction[] = [
    {
      labelKey: 'nav.taskBuilder',
      descKey: 'dashboard.quickNewFlow',
      icon: 'account_tree',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      route: '/task-builder'
    },
    {
      labelKey: 'nav.chat',
      descKey: 'dashboard.quickNewChat',
      icon: 'chat',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-900/30',
      route: '/chatbot'
    },
    {
      labelKey: 'models.title',
      descKey: 'dashboard.quickModels',
      icon: 'smart_toy',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      route: '/ai-models'
    }
  ];

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading = true;
    await Promise.all([
      this.loadFlowStats(),
      this.loadConversationStats(),
      this.loadModelStats(),
      this.loadRecentExecutions(),
    ]);
    this.ngZone.run(() => { this.loading = false; });
  }

  private async loadFlowStats() {
    try {
      const rows = await window.agi?.flow.list() ?? [];
      this.ngZone.run(() => {
        this.totalFlows = rows.length;
        this.activeFlows = rows.filter((r: any) => r.enabled === 1).length;
        this.recentFlows = rows
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            icon: r.icon ?? 'route',
            iconColor: r.icon_color ?? 'text-blue-600',
            iconBg: r.icon_bg ?? 'bg-blue-50 dark:bg-blue-900/30',
            updatedAt: r.updated_at,
          }));
      });
    } catch (err) {
      this.logger.error('DASHBOARD', 'loadFlowStats', { info: 'Error loading flows', error: err });
    }
  }

  private async loadConversationStats() {
    try {
      const result: any = await window.agi?.chatDb?.listConversations();
      this.ngZone.run(() => {
        const list = Array.isArray(result) ? result : (result?.data ?? []);
        this.totalConversations = list.length;
      });
    } catch (err) {
      this.logger.error('DASHBOARD', 'loadConversationStats', { info: 'Error loading conversations', error: err });
    }
  }

  private async loadModelStats() {
    try {
      const models = await window.agi?.chat?.listModels() ?? [];
      this.ngZone.run(() => {
        this.availableModels = Array.isArray(models) ? models.length : 0;
      });
    } catch (err) {
      this.logger.error('DASHBOARD', 'loadModelStats', { info: 'Error loading models', error: err });
    }
  }

  private async loadRecentExecutions() {
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const to = now.toISOString();
      const logs = await window.agi?.executionLog?.listByRange(from, to) ?? [];
      this.ngZone.run(() => {
        this.recentExecutions = logs
          .slice(0, 6)
          .map((l: any) => ({
            id: l.id,
            flowName: l.flow_name ?? l.flowName ?? '—',
            status: l.status === 'success' ? 'success' : l.status === 'running' ? 'running' : 'error',
            startedAt: l.started_at ?? l.startedAt ?? '',
            duration: l.duration_ms ?? l.durationMs,
          }));
      });
    } catch (err) {
      this.logger.error('DASHBOARD', 'loadRecentExecutions', { info: 'Error loading executions', error: err });
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  navigateToFlow(flowId: string) {
    this.router.navigate(['/task-builder'], { queryParams: { flowId } });
  }

  formatDuration(ms?: number): string {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }
}
