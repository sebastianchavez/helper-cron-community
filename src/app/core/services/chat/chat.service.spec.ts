import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { ChatMessage } from '../../models/chat-message.model';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addUserMessage', () => {
    it('should add a user message', () => {
      service.addUserMessage('Hello');
      const messages = service.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0]).toEqual({ role: 'user', content: 'Hello' });
    });

    it('should accumulate multiple user messages', () => {
      service.addUserMessage('First');
      service.addUserMessage('Second');
      expect(service.getMessages().length).toBe(2);
    });
  });

  describe('addAssistantMessage', () => {
    it('should add an assistant message', () => {
      service.addAssistantMessage('Hi there');
      const messages = service.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0]).toEqual({ role: 'assistant', content: 'Hi there' });
    });
  });

  describe('getMessages', () => {
    it('should return empty array initially', () => {
      expect(service.getMessages()).toEqual([]);
    });

    it('should return messages in order', () => {
      service.addUserMessage('User msg');
      service.addAssistantMessage('Assistant msg');
      const messages = service.getMessages();
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });
  });

  describe('getLastMessage', () => {
    it('should return null when no messages', () => {
      expect(service.getLastMessage()).toBeNull();
    });

    it('should return the last message added', () => {
      service.addUserMessage('First');
      service.addAssistantMessage('Second');
      const last = service.getLastMessage();
      expect(last).toEqual({ role: 'assistant', content: 'Second' });
    });
  });

  describe('getMessagesForAPI', () => {
    it('should return messages without system message when no system prompt', () => {
      service.addUserMessage('Hello');
      const apiMessages = service.getMessagesForAPI();
      expect(apiMessages.length).toBe(1);
      expect(apiMessages[0].role).toBe('user');
    });

    it('should prepend system message when system prompt is set', () => {
      service.setSystemPrompt('You are helpful');
      service.addUserMessage('Hello');
      const apiMessages = service.getMessagesForAPI();
      expect(apiMessages.length).toBe(2);
      expect(apiMessages[0]).toEqual({ role: 'system', content: 'You are helpful' });
      expect(apiMessages[1]).toEqual({ role: 'user', content: 'Hello' });
    });

    it('should return empty array when no messages and no system prompt', () => {
      expect(service.getMessagesForAPI()).toEqual([]);
    });
  });

  describe('setSystemPrompt / getSystemPrompt', () => {
    it('should return empty string initially', () => {
      expect(service.getSystemPrompt()).toBe('');
    });

    it('should store and return the system prompt', () => {
      service.setSystemPrompt('Custom prompt');
      expect(service.getSystemPrompt()).toBe('Custom prompt');
    });

    it('should overwrite an existing system prompt', () => {
      service.setSystemPrompt('Old prompt');
      service.setSystemPrompt('New prompt');
      expect(service.getSystemPrompt()).toBe('New prompt');
    });
  });

  describe('clear', () => {
    it('should remove all messages', () => {
      service.addUserMessage('Hello');
      service.addAssistantMessage('Hi');
      service.clear();
      expect(service.getMessages()).toEqual([]);
    });
  });

  describe('messages$ observable', () => {
    it('should emit updated messages when a message is added', (done) => {
      const received: ChatMessage[][] = [];
      service.messages$.subscribe(msgs => received.push(msgs));

      service.addUserMessage('Test');
      // First emission is the initial value [], second is after add
      expect(received.length).toBeGreaterThanOrEqual(2);
      const last = received[received.length - 1];
      expect(last[0]).toEqual({ role: 'user', content: 'Test' });
      done();
    });
  });

  describe('systemPrompt$ observable', () => {
    it('should emit updated value when system prompt changes', (done) => {
      const emitted: string[] = [];
      service.systemPrompt$.subscribe(p => emitted.push(p));

      service.setSystemPrompt('prompt-1');
      expect(emitted).toContain('prompt-1');
      done();
    });
  });
});
