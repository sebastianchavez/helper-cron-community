import { Component, Input, Output, EventEmitter, NgZone, HostListener, ViewChild, ElementRef, AfterViewChecked, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation/translation.service';
import {
  FlowBlock,
  FlowConnection,
  BlockTemplate,
  PendingConnection,
  EndNode
} from '../../task-builder.component';

export type LogEntry = { time: string; type: 'info' | 'success' | 'error' | 'warn'; message: string };

@Component({
  selector: 'app-flow-canvas',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './flow-canvas.component.html',
  styleUrls: ['./flow-canvas.component.scss'],
  host: { class: 'flex-1 flex flex-col min-h-0' }
})
export class FlowCanvasComponent implements AfterViewChecked, DoCheck {

  // --- Data inputs (arrays mutated by reference) ---
  @Input() canvasBlocks: FlowBlock[] = [];
  @Input() connections: FlowConnection[] = [];
  @Input() endNodes: EndNode[] = [];

  // --- State inputs from parent ---
  @Input() selectedBlock: FlowBlock | null = null;
  @Input() selectedEndNode: EndNode | null = null;
  @Input() draggingTemplate: BlockTemplate | null = null;
  @Input() startNodeX = 84;
  @Input() startNodeY = 40;
  @Input() showLogPanel = false;
  @Input() logEntries: LogEntry[] = [];
  @Input() nextBlockId = 1;
  @Input() nextEndNodeId = 1;

  // --- Two-way outputs for scalar parent state ---
  @Output() startNodeXChange = new EventEmitter<number>();
  @Output() startNodeYChange = new EventEmitter<number>();
  @Output() nextBlockIdChange = new EventEmitter<number>();
  @Output() nextEndNodeIdChange = new EventEmitter<number>();

  // --- Action outputs ---
  @Output() blockSelected = new EventEmitter<FlowBlock>();
  @Output() blockDeselected = new EventEmitter<void>();
  @Output() endNodeSelected = new EventEmitter<EndNode>();
  @Output() templateConsumed = new EventEmitter<void>();
  @Output() showLogPanelChange = new EventEmitter<boolean>();
  @Output() logCleared = new EventEmitter<void>();
  @Output() connectionsChange = new EventEmitter<FlowConnection[]>();
  @Output() endNodesChange = new EventEmitter<EndNode[]>();

  // --- Internal canvas state ---
  zoomLevel = 100;
  draggingBlock: FlowBlock | null = null;
  dragOffsetX = 0;
  dragOffsetY = 0;
  pendingConnection: PendingConnection | null = null;
  hoveredInputId: string | null = null;

  // Terminal panel resize
  logPanelHeight = 220;
  private resizingLogPanel = false;
  private logResizeStartY = 0;
  private logResizeStartHeight = 0;
  private boundOnLogResizeMove = this.onLogResizeMove.bind(this);
  private boundOnLogResizeEnd = this.onLogResizeEnd.bind(this);

  // Auto-scroll for log panel
  @ViewChild('logScrollContainer') logScrollContainer?: ElementRef<HTMLDivElement>;
  private lastLogCount = 0;
  private pendingScrollToBottom = false;

  ngDoCheck(): void {
    if (this.logEntries.length !== this.lastLogCount) {
      this.lastLogCount = this.logEntries.length;
      this.pendingScrollToBottom = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.pendingScrollToBottom && this.logScrollContainer) {
      const el = this.logScrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.pendingScrollToBottom = false;
    }
  }

  // Context menu
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuBlock: FlowBlock | null = null;
  clipboardBlock: FlowBlock | null = null;
  private clipboardIsCut = false;
  private cutSourceId: string | null = null;

  canvasToast: string | null = null;
  private canvasToastTimeout: ReturnType<typeof setTimeout> | null = null;

  showCanvasToast(msg: string): void {
    this.canvasToast = msg;
    if (this.canvasToastTimeout) clearTimeout(this.canvasToastTimeout);
    this.canvasToastTimeout = setTimeout(() => { this.canvasToast = null; }, 3000);
  }

  readonly startNodeSize = 56;
  readonly blockWidth = 200;
  readonly blockHeight = 60;
  readonly forkBarWidth = 160;
  readonly forkBarHeight = 12;

  constructor(
    private ngZone: NgZone,
    private translationService: TranslationService
  ) {}

  // ============================
  // Zoom
  // ============================
  zoomIn(): void {
    if (this.zoomLevel < 200) this.zoomLevel += 10;
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) this.zoomLevel -= 10;
  }

  resetZoom(): void {
    this.zoomLevel = 100;
  }

  // ============================
  // Selection
  // ============================
  onDeselectClick(): void {
    this.blockDeselected.emit();
  }

  selectEndNode(endNode: EndNode, event: MouseEvent): void {
    event.stopPropagation();
    this.endNodeSelected.emit(endNode);
  }

  // ============================
  // End node management
  // ============================
  addEndNode(): void {
    const id = `end-${this.nextEndNodeId}`;
    this.nextEndNodeId++;
    this.nextEndNodeIdChange.emit(this.nextEndNodeId);
    const lastEnd = this.endNodes[this.endNodes.length - 1];
    const x = lastEnd ? lastEnd.x + 160 : 300;
    const y = lastEnd ? lastEnd.y : 300;
    this.endNodes.push({ id, x, y });
  }

  deleteEndNode(endNode: EndNode): void {
    if (this.endNodes.length <= 1) return;
    this.endNodes = this.endNodes.filter(e => e.id !== endNode.id);
    this.endNodesChange.emit(this.endNodes);
    this.connections = this.connections.filter(c => c.to !== endNode.id);
    this.connectionsChange.emit(this.connections);
  }

  // ============================
  // Start node drag
  // ============================
  onStartNodeMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.connector-handle')) return;
    event.stopPropagation();
    this.blockDeselected.emit();

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const onMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('.canvas-grid') as HTMLElement;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      this.ngZone.run(() => {
        this.startNodeX = Math.max(0, (e.clientX - canvasRect.left + canvas.scrollLeft - offsetX) * (100 / this.zoomLevel));
        this.startNodeY = Math.max(0, (e.clientY - canvasRect.top + canvas.scrollTop - offsetY) * (100 / this.zoomLevel));
        this.startNodeXChange.emit(this.startNodeX);
        this.startNodeYChange.emit(this.startNodeY);
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ============================
  // End node drag
  // ============================
  onEndNodeMouseDown(event: MouseEvent, endNode: EndNode): void {
    if ((event.target as HTMLElement).closest('.connector-handle')) return;
    event.stopPropagation();
    this.selectEndNode(endNode, event);

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const onMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('.canvas-grid') as HTMLElement;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      this.ngZone.run(() => {
        endNode.x = Math.max(0, (e.clientX - canvasRect.left + canvas.scrollLeft - offsetX) * (100 / this.zoomLevel));
        endNode.y = Math.max(0, (e.clientY - canvasRect.top + canvas.scrollTop - offsetY) * (100 / this.zoomLevel));
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ============================
  // Drag & Drop from sidebar
  // ============================
  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggingTemplate) return;

    const canvas = (event.currentTarget as HTMLElement);
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left + canvas.scrollLeft) * (100 / this.zoomLevel);
    const y = (event.clientY - rect.top + canvas.scrollTop) * (100 / this.zoomLevel);

    let config: { [key: string]: any } = {};

    const newBlock: FlowBlock = {
      id: `block-${this.nextBlockId}`,
      type: this.draggingTemplate.type,
      label: this.draggingTemplate.labelKey,
      icon: this.draggingTemplate.icon,
      iconColor: this.draggingTemplate.iconColor,
      bgColor: 'bg-white dark:bg-gray-800',
      category: this.draggingTemplate.category,
      x: Math.max(0, x - 100),
      y: Math.max(0, y - 30),
      config
    };

    this.nextBlockId++;
    this.nextBlockIdChange.emit(this.nextBlockId);
    this.canvasBlocks.push(newBlock);
    this.templateConsumed.emit();
  }

  // ============================
  // Block drag on canvas
  // ============================
  onBlockMouseDown(event: MouseEvent, block: FlowBlock): void {
    if ((event.target as HTMLElement).closest('.connector-handle')) return;
    event.stopPropagation();
    this.draggingBlock = block;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.draggingBlock) return;
      const canvas = document.querySelector('.canvas-grid') as HTMLElement;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      this.ngZone.run(() => {
        this.draggingBlock!.x = Math.max(0, (e.clientX - canvasRect.left + canvas.scrollLeft - this.dragOffsetX) * (100 / this.zoomLevel));
        this.draggingBlock!.y = Math.max(0, (e.clientY - canvasRect.top + canvas.scrollTop - this.dragOffsetY) * (100 / this.zoomLevel));
      });
    };

    const onMouseUp = () => {
      this.draggingBlock = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    this.blockSelected.emit(block);
  }

  // ============================
  // Connection drag
  // ============================
  onConnectorOutputDragStart(event: MouseEvent, blockId: string, outputPort?: string): void {
    event.stopPropagation();
    event.preventDefault();

    const block = this.canvasBlocks.find(b => b.id === blockId);
    if (block?.type === 'ai-prompt' && !block.config?.['model']?.trim()) {
      this.showCanvasToast(this.translationService.translate('taskBuilder.aiModelRequired'));
      return;
    }

    let pos: { x: number; y: number };
    if (outputPort === '2xx' || outputPort === '4xx' || outputPort === '5xx') {
      pos = this.getApiRestOutputPos(blockId, outputPort);
    } else {
      pos = this.getOutputConnectorPos(blockId);
    }
    this.pendingConnection = {
      fromId: blockId,
      fromX: pos.x,
      fromY: pos.y,
      toX: pos.x,
      toY: pos.y,
      outputPort
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.pendingConnection) return;
      const canvas = document.querySelector('.canvas-grid') as HTMLElement;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      this.ngZone.run(() => {
        this.pendingConnection!.toX = (e.clientX - canvasRect.left + canvas.scrollLeft) * (100 / this.zoomLevel);
        this.pendingConnection!.toY = (e.clientY - canvasRect.top + canvas.scrollTop) * (100 / this.zoomLevel);
        this.hoveredInputId = this.detectHoveredInput(this.pendingConnection!.toX, this.pendingConnection!.toY);
      });
    };

    const onMouseUp = () => {
      if (this.pendingConnection && this.hoveredInputId) {
        const fromId = this.pendingConnection.fromId;
        const toId = this.hoveredInputId;
        const port = this.pendingConnection.outputPort;

        if (fromId !== toId && !this.connectionExists(fromId, toId)) {
          if (port) {
            this.connections = this.connections.filter(c => !(c.from === fromId && c.outputPort === port));
            this.connections.push({ from: fromId, to: toId, outputPort: port });
          } else {
            // Fork blocks allow multiple output connections (fan-out)
            const fromBlock = this.canvasBlocks.find(b => b.id === fromId);
            const isFork = fromBlock?.type === 'fork';
            if (!isFork) {
              this.connections = this.connections.filter(c => c.from !== fromId);
            }
            this.connections.push({ from: fromId, to: toId });
          }
          this.connectionsChange.emit(this.connections);
        }
      }
      this.pendingConnection = null;
      this.hoveredInputId = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onConnectorInputDragStart(event: MouseEvent, blockId: string): void {
    event.stopPropagation();
    event.preventDefault();
    const existingConn = this.connections.find(c => c.to === blockId);
    if (existingConn) {
      const upstreamId = existingConn.from;
      const port = existingConn.outputPort;
      this.connections = this.connections.filter(c => c !== existingConn);
      this.connectionsChange.emit(this.connections);
      this.onConnectorOutputDragStart(event, upstreamId, port);
    }
  }

  private detectHoveredInput(mouseX: number, mouseY: number): string | null {
    const threshold = 25;
    for (const block of this.canvasBlocks) {
      const isFJ = block.type === 'fork' || block.type === 'join';
      const inputX = block.x + (isFJ ? this.forkBarWidth / 2 : this.blockWidth / 2);
      const inputY = block.y;
      if (Math.abs(mouseX - inputX) < threshold && Math.abs(mouseY - inputY) < threshold) {
        return block.id;
      }
    }
    for (const endNode of this.endNodes) {
      const endX = endNode.x + this.startNodeSize / 2;
      const endY = endNode.y;
      if (Math.abs(mouseX - endX) < threshold && Math.abs(mouseY - endY) < threshold) {
        return endNode.id;
      }
    }
    return null;
  }

  private connectionExists(from: string, to: string): boolean {
    return this.connections.some(c => c.from === from && c.to === to);
  }

  removeConnection(conn: FlowConnection): void {
    this.connections = this.connections.filter(c => c !== conn);
    this.connectionsChange.emit(this.connections);
  }

  // ============================
  // Connector position helpers
  // ============================
  getOutputConnectorPos(blockId: string): { x: number; y: number } {
    if (blockId === 'start') {
      return {
        x: this.startNodeX + this.startNodeSize / 2,
        y: this.startNodeY + this.startNodeSize + 16
      };
    }
    const block = this.canvasBlocks.find(b => b.id === blockId);
    if (block) {
      if (block.type === 'fork' || block.type === 'join') {
        return { x: block.x + this.forkBarWidth / 2, y: block.y + this.forkBarHeight + 24 };
      }
      return { x: block.x + this.blockWidth / 2, y: block.y + this.blockHeight };
    }
    return { x: 0, y: 0 };
  }

  getInputConnectorPos(blockId: string): { x: number; y: number } {
    const endNode = this.endNodes.find(e => e.id === blockId);
    if (endNode) {
      return { x: endNode.x + this.startNodeSize / 2, y: endNode.y };
    }
    const block = this.canvasBlocks.find(b => b.id === blockId);
    if (block) {
      if (block.type === 'fork' || block.type === 'join') {
        return { x: block.x + this.forkBarWidth / 2, y: block.y };
      }
      return { x: block.x + this.blockWidth / 2, y: block.y };
    }
    return { x: 0, y: 0 };
  }

  isForkJoinBlock(block: FlowBlock): boolean {
    return block.type === 'fork' || block.type === 'join';
  }

  isEndNode(id: string): boolean {
    return this.endNodes.some(e => e.id === id);
  }

  // ============================
  // SVG path helpers
  // ============================
  getConnectionPath(conn: FlowConnection): string {
    let from: { x: number; y: number };
    if (conn.outputPort === '2xx' || conn.outputPort === '4xx' || conn.outputPort === '5xx') {
      from = this.getApiRestOutputPos(conn.from, conn.outputPort);
    } else {
      from = this.getOutputConnectorPos(conn.from);
    }
    const to = this.getInputConnectorPos(conn.to);
    return this.buildCurvePath(from.x, from.y, to.x, to.y);
  }

  getConnectionClass(conn: FlowConnection): string {
    if (conn.outputPort === '2xx') return 'connector-line connector-2xx';
    if (conn.outputPort === '4xx') return 'connector-line connector-4xx';
    if (conn.outputPort === '5xx') return 'connector-line connector-5xx';
    return 'connector-line';
  }

  getApiRestOutputPos(blockId: string, port: '2xx' | '4xx' | '5xx'): { x: number; y: number } {
    const block = this.canvasBlocks.find(b => b.id === blockId);
    if (!block) return { x: 0, y: 0 };
    const offsetX = port === '2xx' ? 40 : port === '4xx' ? this.blockWidth / 2 : this.blockWidth - 40;
    return { x: block.x + offsetX, y: block.y + this.blockHeight };
  }

  getPendingConnectionPath(): string {
    if (!this.pendingConnection) return '';
    return this.buildCurvePath(
      this.pendingConnection.fromX,
      this.pendingConnection.fromY,
      this.pendingConnection.toX,
      this.pendingConnection.toY
    );
  }

  private buildCurvePath(x1: number, y1: number, x2: number, y2: number): string {
    const dy = Math.abs(y2 - y1);
    const cpOffset = Math.max(40, dy * 0.5);
    return `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`;
  }

  // ============================
  // Connection helpers
  // ============================
  hasInputConnection(blockId: string): boolean {
    return this.connections.some(c => c.to === blockId);
  }

  hasOutputConnection(blockId: string): boolean {
    return this.connections.some(c => c.from === blockId);
  }

  hasPortConnection(blockId: string, port: string): boolean {
    return this.connections.some(c => c.from === blockId && c.outputPort === port);
  }

  // ============================
  // Canvas toolbar actions
  // ============================
  autoLayout(): void {
    let y = 120;
    for (const block of this.canvasBlocks) {
      block.x = 300;
      block.y = y;
      y += 140;
    }
  }

  toggleLogPanel(): void {
    this.showLogPanel = !this.showLogPanel;
    this.showLogPanelChange.emit(this.showLogPanel);
  }

  clearLogs(): void {
    this.logCleared.emit();
  }

  // ============================
  // Terminal panel resize
  // ============================
  onLogResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.resizingLogPanel = true;
    this.logResizeStartY = event.clientY;
    this.logResizeStartHeight = this.logPanelHeight;
    document.addEventListener('mousemove', this.boundOnLogResizeMove);
    document.addEventListener('mouseup', this.boundOnLogResizeEnd);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }

  private onLogResizeMove(event: MouseEvent): void {
    if (!this.resizingLogPanel) return;
    this.ngZone.run(() => {
      const delta = this.logResizeStartY - event.clientY;
      this.logPanelHeight = Math.max(120, Math.min(600, this.logResizeStartHeight + delta));
    });
  }

  private onLogResizeEnd(): void {
    this.resizingLogPanel = false;
    document.removeEventListener('mousemove', this.boundOnLogResizeMove);
    document.removeEventListener('mouseup', this.boundOnLogResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  // ============================
  // Context menu
  // ============================
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.contextMenuVisible) {
      this.contextMenuVisible = false;
    }
  }

  onBlockContextMenu(event: MouseEvent, block: FlowBlock): void {
    event.preventDefault();
    event.stopPropagation();
    this.blockSelected.emit(block);
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuBlock = block;
    this.contextMenuVisible = true;
  }

  onCanvasContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuBlock = null;
    this.contextMenuVisible = true;
  }

  closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  ctxCopy(): void {
    if (!this.contextMenuBlock) return;
    this.clipboardBlock = {
      ...this.contextMenuBlock,
      config: JSON.parse(JSON.stringify(this.contextMenuBlock.config || {}))
    };
    this.clipboardIsCut = false;
    this.cutSourceId = null;
    this.closeContextMenu();
  }

  ctxCut(): void {
    if (!this.contextMenuBlock) return;
    this.clipboardBlock = {
      ...this.contextMenuBlock,
      config: JSON.parse(JSON.stringify(this.contextMenuBlock.config || {}))
    };
    this.clipboardIsCut = true;
    this.cutSourceId = this.contextMenuBlock.id;
    this.closeContextMenu();
  }

  ctxPaste(): void {
    if (!this.clipboardBlock) return;
    const newId = `block-${this.nextBlockId}`;
    this.nextBlockId++;
    this.nextBlockIdChange.emit(this.nextBlockId);

    const canvas = document.querySelector('.canvas-grid') as HTMLElement;
    let x = 300, y = 200;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      x = (this.contextMenuX - rect.left + canvas.scrollLeft) * (100 / this.zoomLevel);
      y = (this.contextMenuY - rect.top + canvas.scrollTop) * (100 / this.zoomLevel);
    }

    const newBlock: FlowBlock = {
      ...this.clipboardBlock,
      id: newId,
      x,
      y,
      config: JSON.parse(JSON.stringify(this.clipboardBlock.config || {}))
    };

    if (this.clipboardIsCut && this.cutSourceId) {
      this.deleteBlockById(this.cutSourceId);
      this.clipboardBlock = null;
      this.clipboardIsCut = false;
      this.cutSourceId = null;
    }

    this.canvasBlocks.push(newBlock);
    this.blockSelected.emit(newBlock);
    this.closeContextMenu();
  }

  ctxDuplicate(): void {
    if (!this.contextMenuBlock) return;
    const newId = `block-${this.nextBlockId}`;
    this.nextBlockId++;
    this.nextBlockIdChange.emit(this.nextBlockId);

    const newBlock: FlowBlock = {
      ...this.contextMenuBlock,
      id: newId,
      x: this.contextMenuBlock.x + 40,
      y: this.contextMenuBlock.y + 40,
      config: JSON.parse(JSON.stringify(this.contextMenuBlock.config || {}))
    };
    this.canvasBlocks.push(newBlock);
    this.blockSelected.emit(newBlock);
    this.closeContextMenu();
  }

  ctxDelete(): void {
    if (!this.contextMenuBlock) return;
    this.deleteBlockById(this.contextMenuBlock.id);
    this.blockDeselected.emit();
    this.closeContextMenu();
  }

  private deleteBlockById(blockId: string): void {
    const idx = this.canvasBlocks.findIndex(b => b.id === blockId);
    if (idx !== -1) this.canvasBlocks.splice(idx, 1);
    this.connections = this.connections.filter(c => c.from !== blockId && c.to !== blockId);
    this.connectionsChange.emit(this.connections);
  }
}
