import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UiHelper } from '../../../shared/helpers';

export interface ChatUIState {
  loading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  typingText: string;
  streamingDots: string;
  shouldAutoScroll: boolean;
  showNoModelsModal: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatUIService {
  private readonly typingTexts = ['Pensando...', 'Analizando...', 'Escribiendo...', 'Procesando...'];

  private uiStateSubject = new BehaviorSubject<ChatUIState>({
    loading: false,
    isStreaming: false,
    streamingMessageId: null,
    typingText: 'Pensando...',
    streamingDots: '',
    shouldAutoScroll: true,
    showNoModelsModal: false
  });

  public uiState$ = this.uiStateSubject.asObservable();

  private typingInterval: any = null;
  private dotsInterval: any = null;
  private lastMessageCount = 0;

  constructor() {}

  getState(): ChatUIState { return this.uiStateSubject.value; }

  startLoading(): void {
    this.updateState({ ...this.uiStateSubject.value, loading: true, shouldAutoScroll: true });
    this.startTypingAnimation();
  }

  stopLoading(): void {
    this.updateState({ ...this.uiStateSubject.value, loading: false });
    this.stopTypingAnimation();
  }

  setLoading(loading: boolean): void {
    this.updateState({ ...this.uiStateSubject.value, loading });
    if (loading) this.startTypingAnimation(); else this.stopTypingAnimation();
  }

  startStreaming(messageId: string): void {
    this.updateState({ ...this.uiStateSubject.value, isStreaming: true, streamingMessageId: messageId });
    this.stopTypingAnimation();
    this.startDotsAnimation();
  }

  stopStreaming(): void {
    this.updateState({ ...this.uiStateSubject.value, isStreaming: false, streamingMessageId: null });
    this.stopDotsAnimation();
  }

  resetLoadingState(): void {
    this.updateState({ ...this.uiStateSubject.value, loading: false, isStreaming: false, streamingMessageId: null });
    this.stopTypingAnimation();
    this.stopDotsAnimation();
  }

  setNoModelsModalVisible(visible: boolean): void {
    this.updateState({ ...this.uiStateSubject.value, showNoModelsModal: visible });
  }

  handleAutoScroll(messagesContainer: ElementRef, currentMessageCount: number): void {
    const state = this.uiStateSubject.value;
    if (state.shouldAutoScroll || currentMessageCount !== this.lastMessageCount) {
      this.forceScrollToBottom(messagesContainer);
      this.lastMessageCount = currentMessageCount;
      if (state.shouldAutoScroll) {
        setTimeout(() => this.updateState({ ...this.uiStateSubject.value, shouldAutoScroll: false }), 1000);
      }
    }
  }

  forceScrollToBottom(messagesContainer: ElementRef): void {
    UiHelper.forceScrollToBottom(messagesContainer);
  }

  showNoModelsModal(): void { this.updateState({ ...this.uiStateSubject.value, showNoModelsModal: true }); }
  hideNoModelsModal(): void { this.updateState({ ...this.uiStateSubject.value, showNoModelsModal: false }); }

  startTypingAnimation(): void {
    this.typingInterval = UiHelper.startTypingAnimation(this.typingTexts, (text) => {
      this.updateState({ ...this.uiStateSubject.value, typingText: text });
    });
  }

  stopTypingAnimation(): void {
    UiHelper.stopAnimation(this.typingInterval);
    this.typingInterval = null;
    this.updateState({ ...this.uiStateSubject.value, typingText: '' });
  }

  startDotsAnimation(): void {
    this.dotsInterval = UiHelper.startDotsAnimation((dots) => {
      this.updateState({ ...this.uiStateSubject.value, streamingDots: dots });
    });
  }

  stopDotsAnimation(): void {
    UiHelper.stopAnimation(this.dotsInterval);
    this.dotsInterval = null;
    this.updateState({ ...this.uiStateSubject.value, streamingDots: '' });
  }

  cleanup(): void {
    this.stopTypingAnimation();
    this.stopDotsAnimation();
  }

  getCurrentState(): ChatUIState { return this.uiStateSubject.value; }

  private updateState(newState: ChatUIState): void {
    this.uiStateSubject.next(newState);
  }
}
