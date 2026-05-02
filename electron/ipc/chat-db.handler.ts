import { ipcMain } from 'electron';
import {
    createConversation,
    listConversations,
    addMessage,
    getMessages,
    deleteConversation,
    updateConversationTitle,
    getConversationsByFolder,
    getConversation,
    moveConversationToFolder,
    updateConversationAssociatedFolder,
    removeConversationAssociatedFolder,
} from '../db/chat.repository';

export function registerChatDbHandler() {
    ipcMain.handle('chat:conversation:create', (_e, title?: string, folderId?: string, assistantRole?: string) =>
        createConversation(title, folderId, assistantRole)
    );

    ipcMain.handle('chat:conversation:list', () => listConversations());

    ipcMain.handle('chat:conversation:by-folder', (_e, folderId: string) =>
        getConversationsByFolder(folderId)
    );

    ipcMain.handle('chat:conversation:get', (_e, conversationId: string) =>
        getConversation(conversationId)
    );

    ipcMain.handle(
        'chat:message:add',
        (_e, payload: { conversationId: string; role: 'user' | 'assistant' | 'system'; content: string }) =>
            addMessage(payload.conversationId, payload.role, payload.content)
    );

    ipcMain.handle(
        'chat:message:list',
        (_e, conversationId: string) => getMessages(conversationId)
    );

    ipcMain.handle(
        'chat:conversation:delete',
        (_e, conversationId: string) => deleteConversation(conversationId)
    );

    ipcMain.handle(
        'chat:conversation:updateTitle',
        (_e, payload: { conversationId: string; title: string }) =>
            updateConversationTitle(payload.conversationId, payload.title)
    );

    ipcMain.handle(
        'chat:conversation:move-to-folder',
        (_e, payload: { conversationId: string; folderId?: string }) =>
            moveConversationToFolder(payload.conversationId, payload.folderId)
    );

    ipcMain.handle(
        'chat:conversation:update-associated-folder',
        (_e, payload: { conversationId: string; folderPath: string }) =>
            updateConversationAssociatedFolder(payload.conversationId, payload.folderPath)
    );

    ipcMain.handle(
        'chat:conversation:remove-associated-folder',
        (_e, conversationId: string) => removeConversationAssociatedFolder(conversationId)
    );
}
