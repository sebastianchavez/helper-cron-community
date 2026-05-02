import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Message } from '../../models/message.model';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'app-messages-area',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './messages-area.component.html',
  styleUrls: ['./messages-area.component.scss']
})
export class MessagesAreaComponent {
  @Input() messages: Message[] = [];
  @Input() loading: boolean = false;
  @Input() isStreaming: boolean = false;
  @Input() typingText: string = 'Pensando...';
  @Input() currentRoleName: string = 'Asistente Libre';

  constructor(private sanitizer: DomSanitizer, private logger: LoggerService) {}

  formatMessageContent(content: string): SafeHtml {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let formattedContent = content;
    const codeBlocks: string[] = [];
    let blockIndex = 0;

    formattedContent = formattedContent.replace(codeBlockRegex, (match, language, code) => {
      const lang = language || 'code';
      const escapedCode = this.escapeHtml(code.trim());
      const codeId = `code-block-${Date.now()}-${blockIndex}`;
      const base64Code = btoa(encodeURIComponent(code.trim()));
      const htmlBlock = `
        <div class="my-4 rounded-md overflow-hidden bg-[#0d1117] border border-slate-700">
          <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700 text-xs text-slate-400">
            <span>${lang}</span>
            <button type="button" class="flex items-center gap-1 hover:text-white transition-colors" data-code-id="${codeId}" data-code-base64="${base64Code}">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              Copiar código
            </button>
          </div>
          <div class="p-4 overflow-x-auto text-sm font-mono text-slate-300">
            <pre><code>${escapedCode}</code></pre>
          </div>
        </div>
      `;
      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      codeBlocks[blockIndex] = htmlBlock;
      blockIndex++;
      return placeholder;
    });

    formattedContent = formattedContent.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    formattedContent = formattedContent.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<strong>$1</strong>');

    const lines = formattedContent.split('\n');
    let inList = false;
    let processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const isListItem = trimmedLine.match(/^\*\s+(.*)/) && !trimmedLine.endsWith('*');

      if (isListItem) {
        const listItemText = trimmedLine.substring(2);
        if (!inList) { processedLines.push('<ul class="list-disc list-inside my-2 space-y-1">'); inList = true; }
        processedLines.push(`<li class="ml-4">${listItemText}</li>`);
      } else {
        if (inList) { processedLines.push('</ul>'); inList = false; }
        if (trimmedLine || !inList) processedLines.push(line);
      }
    }
    if (inList) processedLines.push('</ul>');
    formattedContent = processedLines.join('\n');

    const listMatches: string[] = [];
    let listIndex = 0;
    formattedContent = formattedContent.replace(/<ul[^>]*>[\s\S]*?<\/ul>/g, (match) => {
      const placeholder = `__LIST_PLACEHOLDER_${listIndex}__`;
      listMatches[listIndex] = match;
      listIndex++;
      return placeholder;
    });

    formattedContent = formattedContent.replace(/\n/g, '<br>');

    listMatches.forEach((listHtml, index) => {
      formattedContent = formattedContent.replace(`__LIST_PLACEHOLDER_${index}__`, listHtml);
    });

    codeBlocks.forEach((block, index) => {
      formattedContent = formattedContent.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  copyCodeToClipboard(code: string) {
    navigator.clipboard.writeText(code).catch(err => {
      this.logger.error('MESSAGES-AREA', 'copyCodeToClipboard', { info: 'Error copying code', error: err });
    });
  }

  handleCodeCopyClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest('button[data-code-base64]');
    if (button) {
      const base64Code = button.getAttribute('data-code-base64');
      if (base64Code) {
        try {
          const code = decodeURIComponent(atob(base64Code));
          this.copyCodeToClipboard(code);
        } catch (error) {
          this.logger.error('MESSAGES-AREA', 'handleCodeCopyClick', { info: 'Error decoding code', error });
        }
      }
    }
  }

  trackByMessageId(index: number, message: any): any {
    return message.id || index;
  }
}
