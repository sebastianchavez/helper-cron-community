"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.listConversations = listConversations;
exports.getConversationsByFolder = getConversationsByFolder;
exports.addMessage = addMessage;
exports.getMessages = getMessages;
exports.deleteConversation = deleteConversation;
exports.restoreConversation = restoreConversation;
exports.permanentDeleteConversation = permanentDeleteConversation;
exports.listDeletedConversations = listDeletedConversations;
exports.updateConversationTitle = updateConversationTitle;
exports.moveConversationToFolder = moveConversationToFolder;
const db_1 = require("./db");
const crypto_1 = __importDefault(require("crypto"));
function createConversation(title, folderId) {
    const db = (0, db_1.getDb)();
    const id = crypto_1.default.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
    INSERT INTO conversation (id, title, folder_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title ?? 'Nueva conversación', folderId ?? null, now, now);
    return { id, title: title ?? 'Nueva conversación', folder_id: folderId ?? null, created_at: now, updated_at: now };
}
function listConversations() {
    const db = (0, db_1.getDb)();
    const conversations = db.prepare(`
    SELECT id, title, folder_id, created_at, updated_at
    FROM conversation
    WHERE deleted_at IS NULL AND folder_id IS NULL
    ORDER BY updated_at DESC
  `).all();
    console.log(`[DB] listConversations found ${conversations.length} root conversations`); // Debug
    return conversations;
}
function getConversationsByFolder(folderId) {
    const db = (0, db_1.getDb)();
    const conversations = db.prepare(`
    SELECT id, title, folder_id, created_at, updated_at
    FROM conversation
    WHERE folder_id = ? AND deleted_at IS NULL
    ORDER BY updated_at DESC
  `).all(folderId);
    console.log(`[DB] getConversationsByFolder(${folderId}) found ${conversations.length} conversations`); // Debug
    return conversations;
}
function addMessage(conversationId, role, content) {
    const db = (0, db_1.getDb)();
    const id = crypto_1.default.randomUUID();
    const now = new Date().toISOString();
    const tx = db.transaction(() => {
        db.prepare(`
      INSERT INTO message (id, conversation_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, conversationId, role, content, now);
        db.prepare(`
      UPDATE conversation
      SET updated_at = ?
      WHERE id = ?
    `).run(now, conversationId);
    });
    tx();
    return { id, conversation_id: conversationId, role, content, created_at: now };
}
function getMessages(conversationId) {
    const db = (0, db_1.getDb)();
    return db.prepare(`
    SELECT id, conversation_id, role, content, created_at
    FROM message
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(conversationId);
}
function deleteConversation(conversationId) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    // Soft delete: marcar como eliminada en lugar de borrar físicamente
    db.prepare(`
    UPDATE conversation
    SET deleted_at = ?, updated_at = ?
    WHERE id = ?
  `).run(now, now, conversationId);
}
function restoreConversation(conversationId) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    db.prepare(`
    UPDATE conversation
    SET deleted_at = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, conversationId);
}
function permanentDeleteConversation(conversationId) {
    const db = (0, db_1.getDb)();
    const tx = db.transaction(() => {
        db.prepare(`DELETE FROM message WHERE conversation_id = ?`)
            .run(conversationId);
        db.prepare(`DELETE FROM conversation WHERE id = ?`)
            .run(conversationId);
    });
    tx();
}
function listDeletedConversations() {
    const db = (0, db_1.getDb)();
    return db.prepare(`
    SELECT id, title, folder_id, deleted_at, created_at, updated_at
    FROM conversation
    WHERE deleted_at IS NOT NULL
    ORDER BY deleted_at DESC
  `).all();
}
function updateConversationTitle(conversationId, title) {
    const db = (0, db_1.getDb)();
    db.prepare(`
    UPDATE conversation
    SET title = ?, updated_at = ?
    WHERE id = ?
  `).run(title, new Date().toISOString(), conversationId);
}
function moveConversationToFolder(conversationId, folderId) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    console.log(`[DB] Moving conversation ${conversationId} to folder ${folderId}`); // Debug
    const result = db.prepare(`
    UPDATE conversation
    SET folder_id = ?, updated_at = ?
    WHERE id = ?
  `).run(folderId ?? null, now, conversationId);
    console.log(`[DB] Move result:`, result); // Debug
    // Verificar que se actualizó
    const updated = db.prepare(`
    SELECT id, folder_id FROM conversation WHERE id = ?
  `).get(conversationId);
    console.log(`[DB] Verification:`, updated); // Debug
}
