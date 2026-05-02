import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { OllamaStatusService } from '../../../../core/services/ollama-status/ollama-status.service';
import { AIProvidersService, ProviderGroup } from '../../../../core/services/ai-providers/ai-providers.service';
import { FlowBlock } from '../../task-builder.component';

@Component({
  selector: 'app-block-config-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './block-config-panel.component.html',
})
export class BlockConfigPanelComponent implements OnChanges {
  @Input() selectedBlock: FlowBlock | null = null;
  @Input() canvasBlocks: FlowBlock[] = [];
  @Output() configApplied = new EventEmitter<void>();
  @Output() blockDeleted = new EventEmitter<void>();

  // Apply button feedback
  applyFeedback = false;
  private applyFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Block parameter fields
  blockCustomName = '';
  blockParamName = '';
  blockParamMessage = '';
  blockOptionAutoRetry = true;
  blockOptionNotify = false;

  // localStorage block config
  lsAction: 'get' | 'set' = 'get';
  lsKey = '';
  lsFormat: 'json' | 'string' = 'string';
  lsValue = '';

  // API Rest block config
  apiMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET';
  apiUrl = '';
  apiHeaders = '';
  apiBody = '';
  readonly apiMethods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  // Web Scraping block config
  scrapingUrl = '';
  scrapingHeadless = true;
  scrapingSteps: { action: string; selector: string; value: string; attribute: string; varName: string }[] = [];

  // Save Log block config
  saveLogName = '';
  saveLogValue = '';

  // Delete Log block config
  deleteLogMode: 'by-name' | 'all' = 'by-name';
  deleteLogName = '';

  // Set Variable block config
  setVarAssignments: { name: string; value: string }[] = [{ name: '', value: '' }];

  // AI Prompt block config
  aiModel = '';
  aiPrompt = '';
  aiModelError = false;
  ollamaRunning = false;
  ollamaChecking = false;

  // Model picker modal
  showModelPickerModal = false;
  modelSearchQuery = '';
  providerGroups: ProviderGroup[] = [];
  collapsedGroups: Record<string, boolean> = {};
  modelsLoading = false;

  readonly scrapingActions: { value: string; labelKey: string }[] = [
    { value: 'navigate', labelKey: 'taskBuilder.scrapingActionNavigate' },
    { value: 'click', labelKey: 'taskBuilder.scrapingActionClick' },
    { value: 'type', labelKey: 'taskBuilder.scrapingActionType' },
    { value: 'select', labelKey: 'taskBuilder.scrapingActionSelect' },
    { value: 'extract', labelKey: 'taskBuilder.scrapingActionExtract' },
    { value: 'extractAll', labelKey: 'taskBuilder.scrapingActionExtractAll' },
    { value: 'wait', labelKey: 'taskBuilder.scrapingActionWait' },
    { value: 'screenshot', labelKey: 'taskBuilder.scrapingActionScreenshot' },
    { value: 'scroll', labelKey: 'taskBuilder.scrapingActionScroll' },
    { value: 'evaluate', labelKey: 'taskBuilder.scrapingActionEvaluate' }
  ];

  // Variable output config
  outputVar = '';

  /** Operator display labels */
  constructor(
    private translationService: TranslationService,
    private ngZone: NgZone,
    private ollamaStatusService: OllamaStatusService,
    private aiProvidersService: AIProvidersService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedBlock'] && this.selectedBlock) {
      this.populateFromBlock(this.selectedBlock);
      // Check Ollama status when selecting AI block
      if (this.selectedBlock.type === 'ai-prompt') {
        this.checkOllamaStatus();
      }
    }
  }

  private populateFromBlock(block: FlowBlock): void {
    this.blockCustomName = block.config?.['customName'] || '';
    this.blockParamName = block.config?.['name'] || '';
    this.blockParamMessage = block.config?.['message'] || '';
    this.outputVar = block.config?.['outputVar'] || '';

    if (block.type === 'local-storage') {
      this.lsAction = block.config?.['action'] || 'get';
      this.lsKey = block.config?.['key'] || '';
      this.lsFormat = block.config?.['format'] || 'string';
      this.lsValue = block.config?.['value'] || '';
    }

    if (block.type === 'api-rest') {
      this.apiMethod = block.config?.['method'] || 'GET';
      this.apiUrl = block.config?.['url'] || '';
      this.apiHeaders = block.config?.['headers'] || '';
      this.apiBody = block.config?.['body'] || '';
    }

    if (block.type === 'web-scraping') {
      this.scrapingUrl = block.config?.['url'] || '';
      this.scrapingHeadless = block.config?.['headless'] !== false;
      const steps = block.config?.['steps'];
      this.scrapingSteps = Array.isArray(steps)
        ? steps.map((s: any) => ({
            action: s.action || 'click',
            selector: s.selector || '',
            value: s.value || '',
            attribute: s.attribute || '',
            varName: s.varName || ''
          }))
        : [];
    }

    if (block.type === 'save-log') {
      this.saveLogName = block.config?.['logName'] || '';
      this.saveLogValue = block.config?.['logValue'] || '';
    }

    if (block.type === 'delete-log') {
      this.deleteLogMode = block.config?.['deleteMode'] || 'by-name';
      this.deleteLogName = block.config?.['logName'] || '';
    }

    if (block.type === 'set-variable') {
      const assignments = block.config?.['assignments'];
      if (Array.isArray(assignments) && assignments.length > 0) {
        this.setVarAssignments = assignments.map((a: any) => ({ name: a.name || '', value: a.value || '' }));
      } else {
        // Backward compat: migrate old single-var format
        const oldName = block.config?.['varName'] || '';
        const oldValue = block.config?.['varValue'] || '';
        this.setVarAssignments = oldName ? [{ name: oldName, value: oldValue }] : [{ name: '', value: '' }];
      }
    }

    if (block.type === 'ai-prompt') {
      this.aiModel = block.config?.['model'] || '';
      this.aiPrompt = block.config?.['prompt'] || '';
    }
  }

  applyBlockConfig(): void {
    if (!this.selectedBlock) return;
    if (!this.selectedBlock.config) this.selectedBlock.config = {};

    // Always save custom name
    if (this.blockCustomName.trim()) {
      this.selectedBlock.config['customName'] = this.blockCustomName.trim();
    } else {
      delete this.selectedBlock.config['customName'];
    }

    // Always save outputVar
    if (this.outputVar.trim()) {
      this.selectedBlock.config['outputVar'] = this.outputVar.trim();
    } else {
      delete this.selectedBlock.config['outputVar'];
    }

    if (this.selectedBlock.type === 'local-storage') {
      this.selectedBlock.config['action'] = this.lsAction;
      this.selectedBlock.config['key'] = this.lsKey;
      this.selectedBlock.config['format'] = this.lsFormat;
      if (this.lsAction === 'set') {
        this.selectedBlock.config['value'] = this.lsValue;
      } else {
        delete this.selectedBlock.config['value'];
      }
    } else if (this.selectedBlock.type === 'api-rest') {
      this.selectedBlock.config['method'] = this.apiMethod;
      this.selectedBlock.config['url'] = this.apiUrl;
      this.selectedBlock.config['headers'] = this.apiHeaders;
      this.selectedBlock.config['body'] = this.apiBody;
    } else if (this.selectedBlock.type === 'web-scraping') {
      this.selectedBlock.config['url'] = this.scrapingUrl;
      this.selectedBlock.config['headless'] = this.scrapingHeadless;
      this.selectedBlock.config['steps'] = this.scrapingSteps
        .filter(s => s.action)
        .map(s => ({
          action: s.action,
          selector: s.selector || undefined,
          value: s.value || undefined,
          attribute: s.attribute || undefined,
          varName: s.varName || undefined
        }));
    } else if (this.selectedBlock.type === 'save-log') {
      this.selectedBlock.config['logName'] = this.saveLogName;
      this.selectedBlock.config['logValue'] = this.saveLogValue;
    } else if (this.selectedBlock.type === 'delete-log') {
      this.selectedBlock.config['deleteMode'] = this.deleteLogMode;
      this.selectedBlock.config['logName'] = this.deleteLogMode === 'by-name' ? this.deleteLogName : '';
    } else if (this.selectedBlock.type === 'ai-prompt') {
      if (!this.aiModel.trim()) {
        this.aiModelError = true;
        return;
      }
      this.aiModelError = false;
      this.selectedBlock.config['model'] = this.aiModel;
      this.selectedBlock.config['prompt'] = this.aiPrompt;
    } else if (this.selectedBlock.type === 'set-variable') {
      const valid = this.setVarAssignments
        .filter(a => a.name.trim())
        .map(a => ({ name: a.name.trim(), value: a.value }));
      this.selectedBlock.config['assignments'] = valid;
      // Clean up old single-var keys
      delete this.selectedBlock.config['varName'];
      delete this.selectedBlock.config['varValue'];
    } else if (this.selectedBlock.type === 'fork' || this.selectedBlock.type === 'join') {
      // Fork/Join are structural blocks with no specific config fields
    } else {
      this.selectedBlock.config['name'] = this.blockParamName;
      this.selectedBlock.config['message'] = this.blockParamMessage;
    }

    // Save options
    this.selectedBlock.config['autoRetry'] = this.blockOptionAutoRetry;
    this.selectedBlock.config['notify'] = this.blockOptionNotify;

    this.configApplied.emit();
    this.applyFeedback = true;
    if (this.applyFeedbackTimeout) clearTimeout(this.applyFeedbackTimeout);
    this.applyFeedbackTimeout = setTimeout(() => { this.applyFeedback = false; }, 2000);
  }

  deleteSelectedBlock(): void {
    this.blockDeleted.emit();
  }

  getAvailableVariables(): { name: string; blockLabel: string; blockType: string }[] {
    const vars: { name: string; blockLabel: string; blockType: string }[] = [];
    for (const block of this.canvasBlocks) {
      if (block.id === this.selectedBlock?.id) continue;
      const label = this.translationService.translate(block.label) || block.type;
      if (block.config?.['outputVar']) {
        vars.push({
          name: block.config['outputVar'],
          blockLabel: label,
          blockType: block.type,
        });
      }
      const mappings = block.config?.['mappings'] as Array<{ path: string; varName: string }> | undefined;
      if (mappings) {
        for (const m of mappings) {
          if (m.varName?.trim()) {
            vars.push({
              name: m.varName.trim(),
              blockLabel: label + ' (mapping)',
              blockType: block.type,
            });
          }
        }
      }
    }
    return vars;
  }

  getAllAvailableVars(): { name: string; blockLabel: string; blockType: string; isGlobal?: boolean }[] {
    return this.getAvailableVariables();
  }

  insertVariable(varName: string, field: 'apiUrl' | 'apiHeaders' | 'apiBody' | 'lsValue' | 'lsKey' | 'blockParamName' | 'blockParamMessage' | 'excelDataSource' | 'excelDestination' | 'excelFileName' | 'saveLogName' | 'saveLogValue'): void {
    const ref = `{{${varName}}}`;
    (this as any)[field] = ((this as any)[field] || '') + ref;
  }

  // Scraping step helpers
  addScrapingStep(): void {
    this.scrapingSteps.push({ action: 'click', selector: '', value: '', attribute: '', varName: '' });
  }

  removeScrapingStep(index: number): void {
    this.scrapingSteps.splice(index, 1);
  }

  moveScrapingStepUp(index: number): void {
    if (index <= 0) return;
    const temp = this.scrapingSteps[index];
    this.scrapingSteps[index] = this.scrapingSteps[index - 1];
    this.scrapingSteps[index - 1] = temp;
  }

  moveScrapingStepDown(index: number): void {
    if (index >= this.scrapingSteps.length - 1) return;
    const temp = this.scrapingSteps[index];
    this.scrapingSteps[index] = this.scrapingSteps[index + 1];
    this.scrapingSteps[index + 1] = temp;
  }

  trackStepByIndex(index: number): number {
    return index;
  }

  stepNeedsSelector(action: string): boolean {
    return ['click', 'type', 'select', 'extract', 'extractAll', 'wait', 'screenshot', 'scroll'].includes(action);
  }

  stepNeedsValue(action: string): boolean {
    return ['navigate', 'type', 'select', 'wait', 'screenshot', 'scroll', 'evaluate'].includes(action);
  }

  stepNeedsAttribute(action: string): boolean {
    return ['extract', 'extractAll'].includes(action);
  }

  stepNeedsVarName(action: string): boolean {
    return ['extract', 'extractAll', 'screenshot', 'evaluate'].includes(action);
  }

  getScrapingActionLabel(action: string): string {
    const a = this.scrapingActions.find(sa => sa.value === action);
    return a ? this.translationService.translate(a.labelKey) : action;
  }

  async checkOllamaStatus(): Promise<void> {
    this.ollamaChecking = true;
    try {
      const status = await (window as any).agi?.ollama?.checkStatus();
      this.ngZone.run(() => {
        this.ollamaRunning = !!status?.running;
        this.ollamaChecking = false;
      });
    } catch {
      this.ngZone.run(() => {
        this.ollamaRunning = false;
        this.ollamaChecking = false;
      });
    }
  }

  async openModelPicker(): Promise<void> {
    this.modelSearchQuery = '';
    this.showModelPickerModal = true;
    this.modelsLoading = true;
    this.collapsedGroups = {};
    try {
      const groups = await this.aiProvidersService.loadAll();
      this.ngZone.run(() => {
        this.providerGroups = groups.filter(g => g.models.length > 0);
        this.modelsLoading = false;
      });
    } catch {
      this.ngZone.run(() => {
        this.providerGroups = [];
        this.modelsLoading = false;
      });
    }
  }

  selectModel(modelId: string): void {
    this.aiModel = modelId;
    this.aiModelError = false;
    this.showModelPickerModal = false;
  }

  getFilteredGroupModels(group: ProviderGroup): ProviderGroup['models'] {
    const q = this.modelSearchQuery.toLowerCase().trim();
    if (!q) return group.models;
    return group.models.filter(m => m.displayName.toLowerCase().includes(q));
  }

  get hasAnyFilteredModels(): boolean {
    const q = this.modelSearchQuery.toLowerCase().trim();
    if (!q) return this.providerGroups.some(g => g.models.length > 0);
    return this.providerGroups.some(g =>
      g.models.some(m => m.displayName.toLowerCase().includes(q))
    );
  }
}