import { getDb } from './db';
import crypto from 'crypto';

export function createConversation(title?: string, folderId?: string) {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO conversation (id, title, folder_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title ?? 'Nueva conversación', folderId ?? null, now, now);

  return { id, title: title ?? 'Nueva conversación', folder_id: folderId ?? null, created_at: now, updated_at: now };
}

export function listConversations() {
  const db = getDb();
  const conversations = db.prepare(`
    SELECT id, title, folder_id, created_at, updated_at
    FROM conversation
    WHERE deleted_at IS NULL AND folder_id IS NULL
    ORDER BY updated_at DESC
  `).all();
  
  console.log(`[DB] listConversations found ${conversations.length} root conversations`); // Debug
  return conversations;
}

export function getConversationsByFolder(folderId: string) {
  const db = getDb();
  const conversations = db.prepare(`
    SELECT id, title, folder_id, created_at, updated_at
    FROM conversation
    WHERE folder_id = ? AND deleted_at IS NULL
    ORDER BY updated_at DESC
  `).all(folderId);
  
  console.log(`[DB] getConversationsByFolder(${folderId}) found ${conversations.length} conversations`); // Debug
  return conversations;
}

export function addMessage(conversationId: string, role: 'user'|'assistant'|'system', content: string) {
  const db = getDb();
  const id = crypto.randomUUID();
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

export function getMessages(conversationId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT id, conversation_id, role, content, created_at
    FROM message
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(conversationId);
}

export function deleteConversation(conversationId: string) {
  const db = getDb();
  const now = new Date().toISOString();

  // Soft delete: marcar como eliminada en lugar de borrar físicamente
  db.prepare(`
    UPDATE conversation
    SET deleted_at = ?, updated_at = ?
    WHERE id = ?
  `).run(now, now, conversationId);
}

export function restoreConversation(conversationId: string) {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE conversation
    SET deleted_at = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, conversationId);
}

export function permanentDeleteConversation(conversationId: string) {
  const db = getDb();

  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM message WHERE conversation_id = ?`)
      .run(conversationId);

    db.prepare(`DELETE FROM conversation WHERE id = ?`)
      .run(conversationId);
  });

  tx();
}

export function listDeletedConversations() {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, folder_id, deleted_at, created_at, updated_at
    FROM conversation
    WHERE deleted_at IS NOT NULL
    ORDER BY deleted_at DESC
  `).all();
}

export function updateConversationTitle(conversationId: string, title: string) {
  const db = getDb();

  db.prepare(`
    UPDATE conversation
    SET title = ?, updated_at = ?
    WHERE id = ?
  `).run(title, new Date().toISOString(), conversationId);
}

export function moveConversationToFolder(conversationId: string, folderId?: string) {
  const db = getDb();
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
