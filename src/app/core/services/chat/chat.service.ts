import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private systemPromptSubject = new BehaviorSubject<string>('');

  messages$ = this.messagesSubject.asObservable();
  systemPrompt$ = this.systemPromptSubject.asObservable();

  constructor() {}

  addUserMessage(content: string) {
    this.messagesSubject.next([...this.messagesSubject.value, { role: 'user', content }]);
  }

  addAssistantMessage(content: string) {
    this.messagesSubject.next([...this.messagesSubject.value, { role: 'assistant', content }]);
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  getLastMessage(): ChatMessage | null {
    const messages = this.getMessages();
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  getMessagesForAPI(): any[] {
    const systemPrompt = this.getSystemPrompt();
    const messages = this.getMessages();
    const apiMessages: any[] = [];
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }
    apiMessages.push(...messages);
    return apiMessages;
  }

  setSystemPrompt(prompt: string) {
    this.systemPromptSubject.next(prompt);
  }

  getSystemPrompt(): string {
    return this.systemPromptSubject.value;
  }

  clear() {
    this.messagesSubject.next([]);
  }

}
