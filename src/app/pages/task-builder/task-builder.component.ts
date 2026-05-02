import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../core/services/translation/translation.service';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';
import { BlockSidebarComponent } from './components/block-sidebar/block-sidebar.component';
import { FlowHeaderComponent } from './components/flow-header/flow-header.component';
import { FlowCanvasComponent } from './components/flow-canvas/flow-canvas.component';
import { FlowConfigSidebarComponent } from './components/flow-config-sidebar/flow-config-sidebar.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

export interface FlowBlock {
  id: string;
  type: string;
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  category: string;
  x: number;
  y: number;
  config?: { [key: string]: any };
}

export interface FlowConnection {
  from: string;
  to: string;
  /** For conditional blocks: which output port ('true' | 'false'). For for-each: 'loop-body' | 'loop-done'. Undefined for normal blocks. */
  outputPort?: string;
}

export interface BlockTemplate {
  type: string;
  labelKey: string;
  descKey: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  category: string;
}

/** Temporary connection being drawn by user dragging from a connector */
export interface PendingConnection {
  fromId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** Which output port is being dragged (for conditional / for-each blocks) */
  outputPort?: string;
}

export interface EndNode {
  id: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-task-builder',
  standalone: true,
  imports: [CommonModule, NavigationMenuComponent, BlockSidebarComponent, FlowHeaderComponent, FlowCanvasComponent, FlowConfigSidebarComponent],
  templateUrl: './task-builder.component.html',
  styleUrls: ['./task-builder.component.scss']
})
export class TaskBuilderComponent implements OnInit {

  // Canvas state
  canvasBlocks: FlowBlock[] = [];
  connections: FlowConnection[] = [];
  endNodes: EndNode[] = [];
  selectedBlock: FlowBlock | null = null;
  selectedEndNode: EndNode | null = null;
  nextBlockId = 1;
  nextEndNodeId = 1;

  // Drag state
  draggingTemplate: BlockTemplate | null = null;

  // Start node position (needed for save)
  startNodeX = 84;
  startNodeY = 40;

  // Run / Log panel state
  isRunning = false;
  stopRequested = false;
  showLogPanel = false;
  logEntries: { time: string; type: 'info' | 'success' | 'error' | 'warn'; message: string }[] = [];

  // Right sidebar - schedule config
  scheduleEnabled = false;
  scheduleType: 'interval' | 'specific' = 'interval';
  intervalValue = 30;
  intervalUnit: 'minutes' | 'hours' | 'days' = 'minutes';
  specificTime = '09:00';
  selectedDays: { [key: string]: boolean } = {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false
  };

  // Flow identity
  editingFlowId: string | null = null;
  flowName = '';
  flowIcon = 'route';
  flowIconColor = 'text-blue-600';
  flowIconBg = 'bg-blue-50 dark:bg-blue-900/30';
  flowSaving = false;
  flowSaveSuccess = false;

  // Right panel state
  showConfigPanel = true;

  // Resizable panels
  leftPanelWidth = 288; // default w-72 = 18rem = 288px
  rightPanelWidth = 320; // default w-80 = 20rem = 320px
  private resizing: 'left' | 'right' | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private boundOnResizeMove = this.onResizeMove.bind(this);
  private boundOnResizeEnd = this.onResizeEnd.bind(this);

  // Block templates available in sidebar
  blockCategories: { key: string; labelKey: string; blocks: BlockTemplate[] }[] = [
    {
      key: 'dataCapture',
      labelKey: 'taskBuilder.categoryDataCapture',
      blocks: [
        {
          type: 'local-storage',
          labelKey: 'taskBuilder.blockLocalStorage',
          descKey: 'taskBuilder.blockLocalStorageDesc',
          icon: 'database',
          iconColor: 'text-cyan-600 dark:text-cyan-400',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
          category: 'dataCapture'
        }
      ]
    },
    {
      key: 'logicControl',
      labelKey: 'taskBuilder.categoryLogicControl',
      blocks: [
        {
          type: 'set-variable',
          labelKey: 'taskBuilder.blockSetVariable',
          descKey: 'taskBuilder.blockSetVariableDesc',
          icon: 'edit_note',
          iconColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          category: 'logicControl'
        },
        {
          type: 'fork',
          labelKey: 'taskBuilder.blockFork',
          descKey: 'taskBuilder.blockForkDesc',
          icon: 'call_split',
          iconColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          category: 'logicControl'
        },
        {
          type: 'join',
          labelKey: 'taskBuilder.blockJoin',
          descKey: 'taskBuilder.blockJoinDesc',
          icon: 'call_merge',
          iconColor: 'text-sky-600 dark:text-sky-400',
          bgColor: 'bg-sky-50 dark:bg-sky-900/30',
          category: 'logicControl'
        }
      ]
    },
    {
      key: 'integrations',
      labelKey: 'taskBuilder.categoryIntegrations',
      blocks: [
        {
          type: 'api-rest',
          labelKey: 'taskBuilder.blockApiRest',
          descKey: 'taskBuilder.blockApiRestDesc',
          icon: 'cloud',
          iconColor: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-900/30',
          category: 'integrations'
        },
        {
          type: 'ai-prompt',
          labelKey: 'taskBuilder.blockAiPrompt',
          descKey: 'taskBuilder.blockAiPromptDesc',
          icon: 'psychology',
          iconColor: 'text-violet-600 dark:text-violet-400',
          bgColor: 'bg-violet-50 dark:bg-violet-900/30',
          category: 'integrations'
        }
      ]
    }
  ];



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const flowId = params['flowId'];
      if (flowId) {
        this.editingFlowId = String(flowId);
        this.loadFlowFromDb(this.editingFlowId);
      } else {
        // New flow – start with a clean canvas
        this.canvasBlocks = [];
        this.connections = [];
        this.endNodes = [{ id: 'end-1', x: 84, y: 300 }];
        this.nextBlockId = 1;
        this.nextEndNodeId = 2;
        this.editingFlowId = null;
      }
    });
  }

  private async loadFlowFromDb(flowId: string): Promise<void> {
    try {
      const flow = await window.agi?.flow.get(flowId);
      if (flow) {
        // Load canvas data
        this.canvasBlocks = flow.canvas_blocks ? JSON.parse(flow.canvas_blocks) : [];
        this.connections = flow.connections ? JSON.parse(flow.connections) : [];
        this.endNodes = flow.end_nodes ? JSON.parse(flow.end_nodes) : [{ id: 'end-1', x: 84, y: 300 }];
        this.startNodeX = flow.start_node_x ?? 84;
        this.startNodeY = flow.start_node_y ?? 40;

        // Rebuild next IDs
        const blockNums = this.canvasBlocks.map(b => {
          const m = b.id.match(/block-(\d+)/);
          return m ? Number(m[1]) : 0;
        });
        this.nextBlockId = blockNums.length > 0 ? Math.max(...blockNums) + 1 : 1;

        const endNums = this.endNodes.map(e => {
          const m = e.id.match(/end-(\d+)/);
          return m ? Number(m[1]) : 0;
        });
        this.nextEndNodeId = endNums.length > 0 ? Math.max(...endNums) + 1 : 2;

        // Load schedule
        this.scheduleEnabled = !!flow.enabled;
        this.scheduleType = flow.schedule_type || 'interval';
        this.intervalValue = flow.interval_value ?? 30;
        this.flowName = flow.name || '';
        this.flowIcon = flow.icon || 'route';
        this.flowIconColor = flow.icon_color || 'text-blue-600';
        this.flowIconBg = flow.icon_bg || 'bg-blue-50 dark:bg-blue-900/30';
        this.intervalUnit = flow.interval_unit || 'minutes';
        this.specificTime = flow.specific_time || '09:00';
        if (flow.selected_days) {
          try { this.selectedDays = JSON.parse(flow.selected_days); } catch {}
        }
      }
    } catch (err) {
      console.error('Error loading flow:', err);
    }
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  async onNameConfirmed(name: string): Promise<void> {
    this.flowName = name;
    if (!this.editingFlowId) return;
    try {
      await window.agi?.flow.update(this.editingFlowId, { name });
    } catch (err) {
      console.error('Error renaming flow:', err);
    }
  }

  // ============================
  // Block selection (event handlers for canvas child)
  // ============================
  selectBlock(block: FlowBlock): void {
    this.selectedBlock = block;
    this.selectedEndNode = null;
    this.showConfigPanel = true;
  }

  deselectBlock(): void {
    this.selectedBlock = null;
    this.selectedEndNode = null;
  }

  // ============================
  // Drag from sidebar
  // ============================
  onTemplateDragStart(event: DragEvent, template: BlockTemplate): void {
    this.draggingTemplate = template;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', template.type);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  /** Is this blockId an end node? (used by runFlow) */
  isEndNode(id: string): boolean {
    return this.endNodes.some(e => e.id === id);
  }

  // ============================
  // Delete block
  // ============================
  deleteSelectedBlock(): void {
    if (!this.selectedBlock) return;
    const id = this.selectedBlock.id;
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== id);
    this.connections = this.connections.filter(c => c.from !== id && c.to !== id);
    this.selectedBlock = null;
  }

  // ============================
  // Config applied callback from child
  // ============================
  onConfigApplied(): void {
    // Config is applied directly to the selectedBlock by the child component
    // Nothing else needed — block.config is mutated in place
  }

  // ============================
  // Save / Publish
  // ============================
  async saveFlow(): Promise<void> {
    if (this.flowSaving) return;
    this.flowSaving = true;

    try {
      const payload = {
        canvasBlocks: JSON.stringify(this.canvasBlocks),
        connections: JSON.stringify(this.connections),
        endNodes: JSON.stringify(this.endNodes),
        startNodeX: this.startNodeX,
        startNodeY: this.startNodeY,
        blocksCount: this.canvasBlocks.length,
        icon: this.flowIcon,
        iconColor: this.flowIconColor,
        iconBg: this.flowIconBg,
        scheduleType: this.scheduleType,
        intervalValue: this.intervalValue,
        intervalUnit: this.intervalUnit,
        specificTime: this.specificTime,
        selectedDays: JSON.stringify(this.selectedDays),
        enabled: this.scheduleEnabled ? 1 : 0,
      };

      if (this.editingFlowId) {
        // Update existing flow (include name in payload)
        const updatePayload = this.flowName.trim()
          ? { ...payload, name: this.flowName.trim() }
          : payload;
        await window.agi?.flow.update(this.editingFlowId, updatePayload);
      } else {
        // Create new flow
        const defaultName = this.translationService.translate('taskBuilder.newFlowName');
        const newFlow = await window.agi?.flow.create({
          name: this.flowName.trim() || defaultName,
        });
        if (newFlow) {
          this.editingFlowId = newFlow.id;
          this.flowName = newFlow.name;
          await window.agi?.flow.update(newFlow.id, payload);
        }
      }

      this.flowSaveSuccess = true;
      setTimeout(() => this.flowSaveSuccess = false, 2500);
    } catch (err) {
      console.error('Error saving flow:', err);
    } finally {
      this.flowSaving = false;
    }
  }

  // ============================
  stopFlow(): void {
    if (!this.isRunning) return;
    this.stopRequested = true;
    this.addLog('warn', this.translationService.translate('taskBuilder.logFlowStopping'));
  }

  // Run flow (simulation with real actions)
  // ============================
  async runFlow(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.stopRequested = false;
    this.showLogPanel = true;
    this.logEntries = [];

    // Context that flows between blocks – each block can read/write to this
    const context: { [key: string]: any } = {};
    // Variables map for {{varName}} resolution
    const variables: Record<string, any> = {};

    this.addLog('info', this.translationService.translate('taskBuilder.logFlowStarted'));

    // Find first connections from 'start'
    let currentIds = this.connections.filter(c => c.from === 'start').map(c => c.to);

    if (currentIds.length === 0) {
      this.addLog('warn', this.translationService.translate('taskBuilder.logNoConnections'));
      this.addLog('error', this.translationService.translate('taskBuilder.logFlowFinished'));
      this.isRunning = false;
      return;
    }

    const visited = new Set<string>();

    while (currentIds.length > 0) {
      if (this.stopRequested) {
        this.addLog('warn', this.translationService.translate('taskBuilder.logFlowStopped'));
        break;
      }
      const nextIds: string[] = [];

      for (const id of currentIds) {
        if (this.stopRequested) break;

        if (this.isEndNode(id)) {
          this.addLog('success', `[${id}] ${this.translationService.translate('taskBuilder.logEndReached')}`);
          continue;
        }

        const block = this.canvasBlocks.find(b => b.id === id);
        if (!block) continue;

        const label = this.translationService.translate(block.label);
        this.addLog('info', `[${block.id}] ${this.translationService.translate('taskBuilder.logExecuting')} "${label}" (${block.type})`);
        await this.sleep(400);

        // Resolve {{varName}} placeholders in all string config values
        const resolvedBlock = this.resolveBlockVariables(block, variables);

        try {
          // Execute block based on type
          const result = await this.executeBlock(resolvedBlock, context, variables);

          // Store result in named variable if outputVar is set
          const outputVarName = block.config?.['outputVar'];
          if (outputVarName) {
            const rawValue = context['lastResult'] ?? result;
            const outDotIdx = outputVarName.indexOf('.');
            if (outDotIdx !== -1) {
              // Dot-notation outputVar: extract the property path from the result
              const propPath = outputVarName.substring(outDotIdx + 1);
              const extracted = typeof rawValue === 'object' && rawValue !== null
                ? this.resolvePropertyPath(rawValue, propPath)
                : undefined;
              variables[outputVarName] = extracted !== undefined ? extracted : rawValue;
            } else {
              variables[outputVarName] = rawValue;
            }
            const outDisplay = typeof variables[outputVarName] === 'object'
              ? JSON.stringify(variables[outputVarName]).substring(0, 200)
              : String(variables[outputVarName] ?? '').substring(0, 200);
            this.addLog('info', `[${block.id}] → variable "${outputVarName}" = ${outDisplay}`);
          }

          if (block.type === 'api-rest') {
            // API-Rest: route based on HTTP status code
            const statusCode = context['lastStatus'] as number | undefined;
            let port: string;
            if (statusCode !== undefined && statusCode >= 200 && statusCode < 300) {
              port = '2xx';
            } else if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
              port = '4xx';
            } else if (statusCode !== undefined && statusCode >= 500) {
              port = '5xx';
            } else {
              port = '2xx';
            }
            const portLabel = port === '2xx'
              ? this.translationService.translate('taskBuilder.apiRestSuccess')
              : port === '4xx'
              ? this.translationService.translate('taskBuilder.apiRestClientError')
              : this.translationService.translate('taskBuilder.apiRestServerError');
            this.addLog(port === '2xx' ? 'success' : 'error', `[${block.id}] → ${portLabel}`);
            // Follow port-specific connections; portless connections follow always (backward compat)
            const outConns = this.connections.filter(c =>
              c.from === id && (c.outputPort === port || !c.outputPort)
            );
            for (const c of outConns) nextIds.push(c.to);
          } else {
            // Non-conditional: log result and follow all outputs
            if (result !== undefined && result !== null) {
              const display = typeof result === 'object' ? JSON.stringify(result) : String(result);
              this.addLog('success', `[${block.id}] → ${display}`);
            } else {
              this.addLog('success', `[${block.id}] ${this.translationService.translate('taskBuilder.logBlockDone')}`);
            }

            const outConns = this.connections.filter(c => c.from === id);
            for (const c of outConns) nextIds.push(c.to);
          }
        } catch (err: any) {
          this.addLog('error', `[${block.id}] ERROR: ${err?.message || err}`);
          // Don't follow connections on error – execution stops for this branch
        }
      }

      currentIds = nextIds;
    }

    if (!this.stopRequested) {
      this.addLog('info', this.translationService.translate('taskBuilder.logFlowFinished'));
    }
    this.stopRequested = false;
    this.isRunning = false;
  }

  /**
   * Execute a single block and return its result.
   * The context object is shared across all blocks in the run.
   */
  private async executeBlock(block: FlowBlock, context: { [key: string]: any }, variables: Record<string, any>): Promise<any> {
    const config = block.config || {};

    switch (block.type) {
      // ── localStorage ──
      case 'local-storage': {
        const action = config['action'] || 'get';
        const key = config['key'] || '';
        const format = config['format'] || 'string';

        if (!key) {
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logLsNoKey')}`);
          return undefined;
        }

        if (action === 'get') {
          const raw = localStorage.getItem(key);
          let parsed: any = raw;
          if (raw !== null && format === 'json') {
            try { parsed = JSON.parse(raw); } catch { parsed = raw; }
          }
          context['lastResult'] = parsed;
          return parsed === null
            ? `${key} = null`
            : `${key} = ${typeof parsed === 'object' ? JSON.stringify(parsed) : parsed}`;
        } else {
          // set
          const value = config['value'] ?? '';
          localStorage.setItem(key, value);
          context['lastResult'] = value;
          return `${key} ← ${value || '""'}`;
        }
      }

      // ── wait ──
      case 'wait': {
        const ms = Number(config['duration']) || 1000;
        this.addLog('info', `[${block.id}] ${this.translationService.translate('taskBuilder.logWaiting')} ${ms}ms`);
        await this.interruptibleSleep(ms);
        return `${ms}ms`;
      }

      // ── api-rest ──
      case 'api-rest': {
        const method = (config['method'] || 'GET').toUpperCase();
        const url = config['url'] || '';
        const headersRaw = config['headers'] || '';
        const body = config['body'] || '';

        if (!url) {
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logNoUrl')}`);
          return undefined;
        }

        // Parse headers from key:value lines
        const headers: Record<string, string> = {};
        if (headersRaw.trim()) {
          for (const line of headersRaw.split('\n')) {
            const idx = line.indexOf(':');
            if (idx > 0) {
              headers[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
            }
          }
        }

        this.addLog('info', `[${block.id}] ${method} ${url}`);
        if (Object.keys(headers).length > 0) {
          this.addLog('info', `[${block.id}] Headers: ${JSON.stringify(headers)}`);
        }
        if (body && method !== 'GET' && method !== 'DELETE') {
          this.addLog('info', `[${block.id}] Body: ${body.substring(0, 150)}${body.length > 150 ? '...' : ''}`);
        }

        try {
          const fetchOpts: RequestInit = { method, headers };
          if (body && method !== 'GET' && method !== 'DELETE') {
            fetchOpts.body = body;
            if (!headers['Content-Type'] && !headers['content-type']) {
              headers['Content-Type'] = 'application/json';
            }
          }
          const resp = await fetch(url, fetchOpts);
          const respText = await resp.text();
          let data: any;
          try { data = JSON.parse(respText); } catch { data = respText; }
          context['lastResult'] = data;
          context['lastStatus'] = resp.status;
          const statusLabel = resp.ok ? 'success' : 'warn';
          this.addLog(statusLabel, `[${block.id}] Status: ${resp.status} ${resp.statusText}`);
          const preview = typeof data === 'object' ? JSON.stringify(data).substring(0, 300) : String(data).substring(0, 300);
          return `${resp.status} | ${preview}`;
        } catch (err: any) {
          throw new Error(`Fetch failed: ${err?.message}`);
        }
      }

      // ── webhook ──
      case 'webhook': {
        const url = config['url'] || '';
        if (!url) {
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logNoUrl')}`);
          return undefined;
        }
        this.addLog('info', `[${block.id}] → ${url}`);
        try {
          const resp = await fetch(url);
          const body = await resp.text();
          let data: any;
          try { data = JSON.parse(body); } catch { data = body; }
          context['lastResult'] = data;
          return { status: resp.status, data: typeof data === 'string' ? data.substring(0, 200) : data };
        } catch (err: any) {
          throw new Error(`Fetch failed: ${err?.message}`);
        }
      }

      // ── ai-prompt (call Ollama LLM) ──
      case 'ai-prompt': {
        const aiModel = config['model'] || '';
        const aiPrompt = config['prompt'] || '';

        if (!aiPrompt) {
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logAiNoPrompt')}`);
          return undefined;
        }

        // Check if Ollama is running before attempting the request
        try {
          const ollamaStatus = await (window as any).agi?.ollama?.checkStatus();
          if (!ollamaStatus?.running) {
            this.addLog('error', `[${block.id}] ${this.translationService.translate('taskBuilder.logAiOllamaNotRunning')}`);
            throw new Error('Ollama is not running');
          }
        } catch (statusErr: any) {
          if (statusErr?.message === 'Ollama is not running') throw statusErr;
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logAiOllamaCheckFailed')}`);
        }

        const messages: any[] = [];
        const langCode = this.translationService.getCurrentLanguage();
        const langName = this.translationService.getLanguageName(langCode);
        messages.push({ role: 'system', content: `Always respond in ${langName}.` });

        messages.push({ role: 'user', content: aiPrompt });

        this.addLog('info', `[${block.id}] ${this.translationService.translate('taskBuilder.logAiSending')}${aiModel ? ' (' + aiModel + ')' : ''}`);

        try {
          const resp = await (window as any).agi?.chat?.send(messages, aiModel || undefined);
          const content = resp?.content || resp?.message?.content || '';
          context['lastResult'] = content;

          const preview = content.length > 300 ? content.substring(0, 300) + '...' : content;
          this.addLog('success', `[${block.id}] ${this.translationService.translate('taskBuilder.logAiResponse')}: ${preview}`);
          return content;
        } catch (err: any) {
          throw new Error(`AI request failed: ${err?.message || err}`);
        }
      }

      // ── set-variable (assign values to flow-scoped variables) ──
      case 'set-variable': {
        // Support new multi-assignment format and old single-var format
        let assignments: { name: string; value: string }[] = config['assignments'] as any[];
        if (!Array.isArray(assignments) || assignments.length === 0) {
          // Backward compat: old single-variable format
          const name = config['varName'] || '';
          const value = config['varValue'] ?? '';
          assignments = name ? [{ name, value }] : [];
        }

        if (assignments.length === 0) {
          this.addLog('warn', `[${block.id}] ${this.translationService.translate('taskBuilder.logSetVarNoName')}`);
          return undefined;
        }

        let lastParsed: any;
        for (const a of assignments) {
          if (!a.name) continue;
          let parsedValue: any = a.value;
          if (typeof a.value === 'string' && a.value.trim().length > 0) {
            try { parsedValue = JSON.parse(a.value); } catch { /* keep as string */ }
          }
          variables[a.name] = parsedValue;
          lastParsed = parsedValue;

          const display = typeof parsedValue === 'object'
            ? JSON.stringify(parsedValue).substring(0, 150)
            : String(parsedValue).substring(0, 150);
          this.addLog('success', `[${block.id}] ${a.name} = ${display}`);
        }

        context['lastResult'] = lastParsed;
        return lastParsed;
      }

      // ── fork (pass-through, fan-out to multiple outputs) ──
      case 'fork': {
        this.addLog('info', `[${block.id}] ${this.translationService.translate('taskBuilder.logForkSplit')}`);
        // Pass last result through unchanged
        return context['lastResult'];
      }

      // ── join (synchronization point, pass-through) ──
      case 'join': {
        this.addLog('info', `[${block.id}] ${this.translationService.translate('taskBuilder.logJoinMerge')}`);
        // Pass last result through unchanged
        return context['lastResult'];
      }

      // ── generic / unknown ──
      default: {
        const name = config['name'] || block.type;
        context['lastResult'] = name;
        return name;
      }
    }
  }

  toggleLogPanel(): void {
    this.showLogPanel = !this.showLogPanel;
  }

  clearLogs(): void {
    this.logEntries = [];
  }

  private addLog(type: 'info' | 'success' | 'error' | 'warn', message: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logEntries = [...this.logEntries, { time, type, message }];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Like sleep() but returns early when stopRequested is set, checking every 100 ms. */
  private async interruptibleSleep(ms: number): Promise<void> {
    const step = 100;
    let elapsed = 0;
    while (elapsed < ms) {
      if (this.stopRequested) return;
      await this.sleep(Math.min(step, ms - elapsed));
      elapsed += step;
    }
  }

  // ============================
  // Panel resize
  // ============================
  onResizeStart(event: MouseEvent, panel: 'left' | 'right'): void {
    event.preventDefault();
    this.resizing = panel;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = panel === 'left' ? this.leftPanelWidth : this.rightPanelWidth;
    document.addEventListener('mousemove', this.boundOnResizeMove);
    document.addEventListener('mouseup', this.boundOnResizeEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.resizing) return;
    this.ngZone.run(() => {
      const delta = event.clientX - this.resizeStartX;
      if (this.resizing === 'left') {
        this.leftPanelWidth = Math.max(200, Math.min(500, this.resizeStartWidth + delta));
      } else {
        this.rightPanelWidth = Math.max(260, Math.min(600, this.resizeStartWidth - delta));
      }
    });
  }

  private onResizeEnd(): void {
    this.resizing = null;
    document.removeEventListener('mousemove', this.boundOnResizeMove);
    document.removeEventListener('mouseup', this.boundOnResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  // ============================
  // Variable resolution helpers
  // ============================

  /** Resolve a dot-notation path on an object, e.g. "data.users[0].name" */
  private resolvePropertyPath(obj: any, path: string): any {
    if (obj === null || obj === undefined) return undefined;
    // Auto-parse JSON strings to allow dot-notation access on stringified objects
    if (typeof obj === 'string') {
      const trimmed = obj.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { obj = JSON.parse(trimmed); } catch { /* keep as string */ }
      }
    }
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }

  /** Replace all {{varName}} or {{varName.path}} placeholders in a string */
  private resolveVariablesInText(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{([\w]+(?:\.[\w\[\]]+)*)\}\}/g, (_match, expr: string) => {
      const dotIdx = expr.indexOf('.');
      let val: any;
      if (dotIdx === -1) {
        val = variables[expr];
      } else if (variables[expr] !== undefined) {
        // Exact flat-key match takes priority (e.g. outputVar was "user.token")
        val = variables[expr];
      } else {
        const varName = expr.substring(0, dotIdx);
        const path = expr.substring(dotIdx + 1);
        val = this.resolvePropertyPath(variables[varName], path);
      }
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });
  }

  /** Create a copy of a block with all string config values resolved */
  private resolveBlockVariables(block: FlowBlock, variables: Record<string, any>): FlowBlock {
    if (!block.config) return block;
    const resolvedConfig: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(block.config)) {
      if (key === 'outputVar' || key === 'mappings' || key === 'code') {
        resolvedConfig[key] = value;
      } else if (key === 'assignments' && Array.isArray(value)) {
        resolvedConfig[key] = value.map((a: any) => ({
          name: a.name,
          value: typeof a.value === 'string' ? this.resolveVariablesInText(a.value, variables) : a.value
        }));
      } else if (typeof value === 'string') {
        resolvedConfig[key] = this.resolveVariablesInText(value, variables);
      } else {
        resolvedConfig[key] = value;
      }
    }
    return { ...block, config: resolvedConfig };
  }
}
