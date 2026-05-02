import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { BlockConfigPanelComponent } from '../block-config-panel/block-config-panel.component';
import { FlowBlock } from '../../task-builder.component';

export interface MemoryVariable {
  key: string;
  action: 'get' | 'set' | 'both';
  value: string | null;
  flowName: string;
  isCurrentFlow: boolean;
}

@Component({
  selector: 'app-flow-config-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, BlockConfigPanelComponent],
  templateUrl: './flow-config-sidebar.component.html',
  styleUrls: ['./flow-config-sidebar.component.scss']
})
export class FlowConfigSidebarComponent implements OnInit, OnChanges {

  // ── Schedule config (two-way bindings) ──
  @Input() scheduleEnabled = false;
  @Output() scheduleEnabledChange = new EventEmitter<boolean>();

  @Input() scheduleType: 'interval' | 'specific' = 'interval';
  @Output() scheduleTypeChange = new EventEmitter<'interval' | 'specific'>();

  @Input() intervalValue = 30;
  @Output() intervalValueChange = new EventEmitter<number>();

  @Input() intervalUnit: 'minutes' | 'hours' | 'days' = 'minutes';
  @Output() intervalUnitChange = new EventEmitter<'minutes' | 'hours' | 'days'>();

  @Input() specificTime = '09:00';
  @Output() specificTimeChange = new EventEmitter<string>();

  @Input() selectedDays: { [key: string]: boolean } = {};
  @Output() selectedDaysChange = new EventEmitter<{ [key: string]: boolean }>();

  // ── Block config panel pass-through ──
  @Input() selectedBlock: FlowBlock | null = null;
  @Input() canvasBlocks: FlowBlock[] = [];
  @Input() editingFlowId: string | null = null;

  @Output() configApplied = new EventEmitter<void>();
  @Output() blockDeleted = new EventEmitter<void>();

  // ── Memory variables panel ──
  memoryVarsExpanded = false;
  memoryVariables: MemoryVariable[] = [];
  memoryLoading = false;
  memorySearchQuery = '';

  // ── Copy variable ──
  copiedVarName: string | null = null;
  private copiedVarTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Static data (owned by this component) ──
  weekdays = [
    { key: 'mon', labelKey: 'taskBuilder.dayMon' },
    { key: 'tue', labelKey: 'taskBuilder.dayTue' },
    { key: 'wed', labelKey: 'taskBuilder.dayWed' },
    { key: 'thu', labelKey: 'taskBuilder.dayThu' },
    { key: 'fri', labelKey: 'taskBuilder.dayFri' },
    { key: 'sat', labelKey: 'taskBuilder.daySat' },
    { key: 'sun', labelKey: 'taskBuilder.daySun' }
  ];

  constructor(
    private ngZone: NgZone,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // Reload memory variables when canvasBlocks change (block added/removed/configured)
    if (changes['canvasBlocks'] && this.memoryVarsExpanded) {
      this.loadMemoryVariables();
    }
  }

  // ── Methods ──
  setScheduleType(type: 'interval' | 'specific'): void {
    this.scheduleType = type;
    this.scheduleTypeChange.emit(type);
  }

  onIntervalValueChange(value: number): void {
    this.intervalValue = value;
    this.intervalValueChange.emit(value);
  }

  onIntervalUnitChange(unit: 'minutes' | 'hours' | 'days'): void {
    this.intervalUnit = unit;
    this.intervalUnitChange.emit(unit);
  }

  onSpecificTimeChange(time: string): void {
    this.specificTime = time;
    this.specificTimeChange.emit(time);
  }

  toggleDay(dayKey: string): void {
    this.selectedDays[dayKey] = !this.selectedDays[dayKey];
    this.selectedDaysChange.emit(this.selectedDays);
  }

  getAvailableBlockVars(): { name: string; blockLabel: string; blockType: string }[] {
    const vars: { name: string; blockLabel: string; blockType: string }[] = [];
    for (const block of this.canvasBlocks) {
      if (block.id === this.selectedBlock?.id) continue;
      const label = this.translationService.translate(block.label) || block.type;
      if (block.config?.['outputVar']) {
        vars.push({ name: block.config['outputVar'], blockLabel: label, blockType: block.type });
      }
      const mappings = block.config?.['mappings'] as Array<{ path: string; varName: string }> | undefined;
      if (mappings) {
        for (const m of mappings) {
          if (m.varName?.trim()) {
            vars.push({ name: m.varName.trim(), blockLabel: label + ' (mapping)', blockType: block.type });
          }
        }
      }
    }
    return vars;
  }

  copyVar(name: string): void {
    navigator.clipboard.writeText('{{' + name + '}}').then(() => {
      if (this.copiedVarTimer) clearTimeout(this.copiedVarTimer);
      this.copiedVarName = name;
      this.copiedVarTimer = setTimeout(() => { this.copiedVarName = null; }, 1500);
    });
  }

  // ── Memory Variables Panel ──
  toggleMemoryPanel(): void {
    this.memoryVarsExpanded = !this.memoryVarsExpanded;
    if (this.memoryVarsExpanded) {
      this.loadMemoryVariables();
    }
  }

  async loadMemoryVariables(): Promise<void> {
    this.memoryLoading = true;
    const vars: MemoryVariable[] = [];
    const seenKeys = new Map<string, MemoryVariable>();

    // 1. Scan current flow's canvasBlocks
    this.extractKeysFromBlocks(
      this.canvasBlocks,
      this.translationService.translate('taskBuilder.memVarThisFlow'),
      true,
      seenKeys
    );

    // 2. Load all other flows from DB and scan their blocks
    try {
      const allFlows = await window.agi?.flow.list() ?? [];
      for (const flow of allFlows) {
        if (flow.id === this.editingFlowId) continue;
        try {
          const fullFlow = await window.agi?.flow.get(flow.id);
          if (fullFlow?.canvas_blocks) {
            const blocks: FlowBlock[] = JSON.parse(fullFlow.canvas_blocks);
            this.extractKeysFromBlocks(blocks, flow.name || flow.id, false, seenKeys);
          }
        } catch { /* skip broken flows */ }
      }
    } catch { /* DB error */ }

    // 3. Read current localStorage values for each key
    for (const [, memVar] of seenKeys) {
      try {
        const raw = localStorage.getItem(memVar.key);
        memVar.value = raw;
      } catch {
        memVar.value = null;
      }
      vars.push(memVar);
    }

    // Sort: current flow first, then alphabetically by key
    vars.sort((a, b) => {
      if (a.isCurrentFlow !== b.isCurrentFlow) return a.isCurrentFlow ? -1 : 1;
      return a.key.localeCompare(b.key);
    });

    this.ngZone.run(() => {
      this.memoryVariables = vars;
      this.memoryLoading = false;
    });
  }

  private extractKeysFromBlocks(
    blocks: FlowBlock[],
    flowName: string,
    isCurrentFlow: boolean,
    seenKeys: Map<string, MemoryVariable>
  ): void {
    for (const block of blocks) {
      if (block.type !== 'local-storage') continue;
      const key = block.config?.['key'];
      if (!key) continue;

      const action = block.config?.['action'] || 'get';

      if (seenKeys.has(key)) {
        const existing = seenKeys.get(key)!;
        // Upgrade action to 'both' if used for both get and set
        if (existing.action !== action && existing.action !== 'both') {
          existing.action = 'both';
        }
        // Prefer current flow as label
        if (isCurrentFlow && !existing.isCurrentFlow) {
          existing.flowName = flowName;
          existing.isCurrentFlow = true;
        }
      } else {
        seenKeys.set(key, {
          key,
          action: action as 'get' | 'set',
          value: null,
          flowName,
          isCurrentFlow
        });
      }
    }
  }

  get filteredMemoryVariables(): MemoryVariable[] {
    if (!this.memorySearchQuery.trim()) return this.memoryVariables;
    const q = this.memorySearchQuery.toLowerCase();
    return this.memoryVariables.filter(v =>
      v.key.toLowerCase().includes(q) ||
      v.flowName.toLowerCase().includes(q) ||
      (v.value && v.value.toLowerCase().includes(q))
    );
  }

  get currentFlowVars(): MemoryVariable[] {
    return this.filteredMemoryVariables.filter(v => v.isCurrentFlow);
  }

  get otherFlowVars(): MemoryVariable[] {
    return this.filteredMemoryVariables.filter(v => !v.isCurrentFlow);
  }

  truncateValue(value: string | null, maxLen = 60): string {
    if (value === null) return '—';
    if (value.length <= maxLen) return value;
    return value.substring(0, maxLen) + '…';
  }

  copyKeyToClipboard(key: string): void {
    navigator.clipboard.writeText(key);
  }

  deleteMemoryKey(key: string): void {
    localStorage.removeItem(key);
    const memVar = this.memoryVariables.find(v => v.key === key);
    if (memVar) memVar.value = null;
  }

  refreshMemoryVariables(): void {
    this.loadMemoryVariables();
  }
}
