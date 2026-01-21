import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      role: 'system',
      content: 'Hola, ¿en qué puedo ayudarte hoy?.',
    },
  ]);

  messages$ = this.messagesSubject.asObservable();

  addUserMessage(content: string) {
    this.messagesSubject.next([
      ...this.messagesSubject.value,
      { role: 'user', content },
    ]);
  }

  addAssistantMessage(content: string) {
    this.messagesSubject.next([
      ...this.messagesSubject.value,
      { role: 'assistant', content },
    ]);
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  clear() {
    this.messagesSubject.next([]);
  }
}
