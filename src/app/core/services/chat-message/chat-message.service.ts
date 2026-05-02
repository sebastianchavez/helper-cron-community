import { Injectable, NgZone } from '@angular/core';
import { LoggerService } from '../logger/logger.service';
import { TranslationService } from '../translation/translation.service';
import { ContentProcessingService } from '../content-processing/content-processing.service';
import { FileCreationService } from '../file-creation/file-creation.service';
import { ChatService } from '../chat/chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {
  private streamCleanup: (() => void) | null = null;
  private streamingMessageId: string | null = null;
  private isStreaming = false;

  constructor(
    private ngZone: NgZone,
    private logger: LoggerService,
    private translationService: TranslationService,
    private contentProcessingService: ContentProcessingService,
    private fileCreationService: FileCreationService,
    private chat: ChatService
  ) {}

  async sendMessage(
    userMessage: string,
    selectedModel: string,
    currentConversationId: string | null,
    associatedFolderPath: string | null,
    onLoadingStateChange: (loading: boolean) => void,
    onStreamingStateChange: (isStreaming: boolean, messageId: string | null) => void,
    onMessageUpdate: (messages: any[]) => void,
    buildContextFn: () => any[]
  ): Promise<void> {
    onLoadingStateChange(true);
    this.chat.addUserMessage(userMessage);

    const loadingTimeout = setTimeout(() => {
      onLoadingStateChange(false);
      this.resetStreamingState(onStreamingStateChange);
      this.chat.addAssistantMessage('⚠️ Timeout: La respuesta tardó demasiado. Por favor, inténtalo nuevamente.');
    }, 120000);

    if (currentConversationId) {
      await window.agi?.chatDb.addMessage({ conversationId: currentConversationId, role: 'user', content: userMessage });
    }

    const contextMessages = buildContextFn();
    const messageId = Date.now().toString();
    this.streamingMessageId = messageId;

    if (window.agi?.chat.stream) {
      this.streamCleanup = window.agi.chat.stream(
        contextMessages,
        selectedModel,
        (chunk: string) => {
          this.ngZone.run(() => {
            if (!this.isStreaming) {
              this.isStreaming = true;
              onStreamingStateChange(true, this.streamingMessageId);
              this.chat.addAssistantMessage(chunk);
            } else {
              this.updateStreamingMessage(chunk);
            }
          });
        },
        () => {
          this.ngZone.run(async () => {
            clearTimeout(loadingTimeout);
            onLoadingStateChange(false);
            this.resetStreamingState(onStreamingStateChange);

            const last = this.chat.getLastMessage();
            if (last?.role === 'assistant') {
              const fileResult = await this.fileCreationService.processFileCreationCommands(last.content, userMessage, associatedFolderPath);
              if (fileResult.content !== last.content) {
                last.content = fileResult.content;
                onMessageUpdate([...this.chat.getMessages()]);
              }
            }

            if (currentConversationId && last) {
              await window.agi?.chatDb.addMessage({ conversationId: currentConversationId, role: 'assistant', content: last.content });
            }
          });
        },
        (error: any) => {
          this.ngZone.run(() => {
            clearTimeout(loadingTimeout);
            onLoadingStateChange(false);
            this.resetStreamingState(onStreamingStateChange);
            this.chat.addAssistantMessage(`❌ Error: ${error.message || 'Error desconocido'}`);
          });
        }
      );
    } else {
      clearTimeout(loadingTimeout);
      onLoadingStateChange(false);
      this.chat.addAssistantMessage('❌ Streaming no disponible');
    }
  }

  stopResponse(): void {
    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = null;
    }
    this.resetStreamingState(() => {});
  }

  private updateStreamingMessage(chunk: string): void {
    const messages = this.chat.getMessages();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content += chunk;
      }
    }
  }

  private resetStreamingState(onStreamingStateChange: (isStreaming: boolean, messageId: string | null) => void): void {
    this.isStreaming = false;
    this.streamingMessageId = null;
    onStreamingStateChange(false, null);
    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = null;
    }
  }

  cleanup(): void {
    this.stopResponse();
  }
}
