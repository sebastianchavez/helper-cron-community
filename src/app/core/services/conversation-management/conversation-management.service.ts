import { Injectable } from '@angular/core';
import { LoggerService } from '../logger/logger.service';

export interface LoadConversationsResult {
  conversations: any[];
  selectedConversationId?: string;
  associatedFolderPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationManagementService {

  constructor(private logger: LoggerService) {}

  async loadConversations(selectedFolderId: string | null = null): Promise<LoadConversationsResult> {
    if (selectedFolderId) {
      return await this.loadFolderConversations(selectedFolderId);
    }
    const response = await window.agi?.chatDb.listConversations();
    let conversations: any[] = [];
    if (Array.isArray(response)) {
      conversations = response;
    } else if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      conversations = (response as any).data || [];
    }
    return { conversations };
  }

  async loadFolderConversations(folderId: string): Promise<LoadConversationsResult> {
    try {
      const allConversations = await window.agi?.chatDb.listConversations();
      let conversations: any[] = [];
      if (Array.isArray(allConversations)) {
        conversations = allConversations;
      }
      return { conversations, selectedConversationId: undefined, associatedFolderPath: undefined };
    } catch (error) {
      return { conversations: [] };
    }
  }

  async openConversation(conversationId: string): Promise<{ conversation: any; messages: any[] }> {
    try {
      const conversationResult = await window.agi?.chatDb.getConversation(conversationId);
      if (!conversationResult?.success || !conversationResult?.data) {
        throw new Error('Conversación no encontrada o error en BD');
      }
      const conversation = conversationResult.data;
      const messages = await window.agi?.chatDb.getMessages(conversationId) || [];
      return { conversation, messages: messages || [] };
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'openConversation', { info: 'Error opening conversation', error });
      throw error;
    }
  }

  async createConversation(title: string = 'Nueva conversación', folderId?: string): Promise<any> {
    try {
      const newConversation = await window.agi?.chatDb.createConversation(title, folderId);
      let conversation = newConversation?.data || newConversation;
      if (!conversation || !conversation.id) {
        throw new Error('Error al crear la conversación - respuesta vacía o sin ID');
      }
      return conversation;
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'createConversation', { info: 'Error creating conversation', error });
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await window.agi?.chatDb.deleteConversation(conversationId);
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'deleteConversation', { info: 'Error deleting conversation', error });
      throw error;
    }
  }

  async updateConversationTitle(conversationId: string, newTitle: string): Promise<any> {
    try {
      return await window.agi?.chatDb.updateConversationTitle(conversationId, newTitle);
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'updateConversationTitle', { info: 'Error updating title', error });
      throw error;
    }
  }

  async moveConversationToFolder(conversationId: string, targetFolderId: string): Promise<void> {
    try {
      await window.agi?.chatDb.moveConversationToFolder(conversationId, targetFolderId);
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'moveConversationToFolder', { info: 'Error moving conversation', error });
      throw error;
    }
  }

  async addMessageToConversation(conversationId: string, message: any): Promise<any> {
    try {
      return await window.agi?.chatDb.addMessage({ conversationId, ...message });
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'addMessageToConversation', { info: 'Error adding message', error });
      throw error;
    }
  }

  async getConversationStats(conversationId: string): Promise<{ messageCount: number; lastActivity: Date; wordCount: number }> {
    try {
      const messages = await window.agi?.chatDb.getMessages(conversationId) || [];
      const conversation = await window.agi?.chatDb.getConversation(conversationId);
      const messageCount = messages?.length || 0;
      const lastActivity = conversation?.updated_at ? new Date(conversation.updated_at) : new Date();
      let wordCount = 0;
      if (messages) {
        wordCount = messages.reduce((total: number, msg: any) => total + (msg.content || '').split(/\s+/).length, 0);
      }
      return { messageCount, lastActivity, wordCount };
    } catch (error) {
      this.logger.error('CONVERSATION-SERVICE', 'getConversationStats', { info: 'Error getting stats', error });
      throw error;
    }
  }
}
