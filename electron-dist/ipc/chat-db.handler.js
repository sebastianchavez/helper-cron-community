"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatDbHandler = registerChatDbHandler;
const electron_1 = require("electron");
const chat_repository_1 = require("../db/chat.repository");
function registerChatDbHandler() {
    electron_1.ipcMain.handle('chat:conversation:create', (_e, title, folderId) => (0, chat_repository_1.createConversation)(title, folderId));
    electron_1.ipcMain.handle('chat:conversation:list', () => (0, chat_repository_1.listConversations)());
    electron_1.ipcMain.handle('chat:conversation:by-folder', (_e, folderId) => (0, chat_repository_1.getConversationsByFolder)(folderId));
    electron_1.ipcMain.handle('chat:message:add', (_e, payload) => (0, chat_repository_1.addMessage)(payload.conversationId, payload.role, payload.content));
    electron_1.ipcMain.handle('chat:message:list', (_e, conversationId) => (0, chat_repository_1.getMessages)(conversationId));
    electron_1.ipcMain.handle('chat:conversation:delete', (_e, conversationId) => (0, chat_repository_1.deleteConversation)(conversationId));
    electron_1.ipcMain.handle('chat:conversation:updateTitle', (_e, payload) => (0, chat_repository_1.updateConversationTitle)(payload.conversationId, payload.title));
    electron_1.ipcMain.handle('chat:conversation:move-to-folder', (_e, payload) => (0, chat_repository_1.moveConversationToFolder)(payload.conversationId, payload.folderId));
    electron_1.ipcMain.handle('chat:conversation:restore', (_e, conversationId) => (0, chat_repository_1.restoreConversation)(conversationId));
    electron_1.ipcMain.handle('chat:conversation:permanent-delete', (_e, conversationId) => (0, chat_repository_1.permanentDeleteConversation)(conversationId));
    electron_1.ipcMain.handle('chat:conversation:list-deleted', () => (0, chat_repository_1.listDeletedConversations)());
}
