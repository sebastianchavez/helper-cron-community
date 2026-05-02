import { getDb, DEFAULT_ASSISTANT_ROLES } from './db';
import crypto from 'crypto';

export interface Conversation {
  id: string;
  title: string;
  folder_id: string | null;
  assistant_role: string | null;
  associated_folder_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface AssistantRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  system_prompt: string;
  category: string;
  color: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatRepositoryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function createConversation(title?: string, folderId?: string, assistantRole?: string): ChatRepositoryResult<Conversation> {
  try {
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO conversation (id, title, folder_id, assistant_role, created_at, updated_at, associated_folder_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title ?? 'Nueva conversación', folderId ?? null, assistantRole ?? null, now, now, null);
    const conversation: Conversation = {
      id, title: title ?? 'Nueva conversación', folder_id: folderId ?? null,
      assistant_role: assistantRole ?? null, associated_folder_path: null,
      deleted_at: null, created_at: now, updated_at: now
    };
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error creating conversation' };
  }
}

export function listConversations(): ChatRepositoryResult<Conversation[]> {
  try {
    const db = getDb();
    const conversations = db.prepare(`
      SELECT id, title, folder_id, assistant_role, associated_folder_path, created_at, updated_at
      FROM conversation
      WHERE deleted_at IS NULL AND folder_id IS NULL
      ORDER BY updated_at DESC
    `).all() as Conversation[];
    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error listing conversations' };
  }
}

export function getConversationsByFolder(folderId: string): ChatRepositoryResult<Conversation[]> {
  try {
    const db = getDb();
    const conversations = db.prepare(`
      SELECT id, title, folder_id, assistant_role, created_at, updated_at, associated_folder_path
      FROM conversation
      WHERE folder_id = ? AND deleted_at IS NULL
      ORDER BY updated_at DESC
    `).all(folderId) as Conversation[];
    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error fetching conversations by folder' };
  }
}

export function getConversation(conversationId: string): ChatRepositoryResult<Conversation> {
  try {
    const db = getDb();
    const conversation = db.prepare(`
      SELECT id, title, folder_id, assistant_role, created_at, updated_at, associated_folder_path
      FROM conversation
      WHERE id = ? AND deleted_at IS NULL
    `).get(conversationId) as Conversation;
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error fetching conversation' };
  }
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
    SELECT id, title, folder_id, assistant_role, deleted_at, created_at, updated_at
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
  db.prepare(`
    UPDATE conversation
    SET folder_id = ?, updated_at = ?
    WHERE id = ?
  `).run(folderId ?? null, now, conversationId);
}

export function updateConversationRole(conversationId: string, roleId: string | null): ChatRepositoryResult<Conversation> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE conversation SET assistant_role = ?, updated_at = ? WHERE id = ?
    `).run(roleId, now, conversationId);
    if (result.changes === 0) {
      return { success: false, error: 'Conversation not found' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error updating conversation role' };
  }
}

// ==========================================
// ASSISTANT ROLES FUNCTIONS
// ==========================================

export function createAssistantRole(roleData: Omit<AssistantRole, 'id' | 'created_at' | 'updated_at'>): ChatRepositoryResult<AssistantRole> {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO assistant_roles (id, name, description, icon, system_prompt, category, color, is_active, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, roleData.name, roleData.description, roleData.icon, roleData.system_prompt, roleData.category, roleData.color, roleData.is_active, roleData.is_system, now, now);
    return getAssistantRoleById(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error creating assistant role' };
  }
}

export function getAssistantRoleById(id: string): ChatRepositoryResult<AssistantRole> {
  try {
    const db = getDb();
    const role = db.prepare('SELECT * FROM assistant_roles WHERE id = ?').get(id) as AssistantRole;
    if (!role) return { success: false, error: 'Assistant role not found' };
    return { success: true, data: role };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error fetching assistant role' };
  }
}

export function listAssistantRoles(activeOnly: boolean = true): ChatRepositoryResult<AssistantRole[]> {
  try {
    const db = getDb();
    const query = activeOnly
      ? 'SELECT * FROM assistant_roles WHERE is_active = true ORDER BY category, name'
      : 'SELECT * FROM assistant_roles ORDER BY category, name';
    const roles = db.prepare(query).all() as AssistantRole[];
    return { success: true, data: roles };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error fetching assistant roles' };
  }
}

export function getAssistantRolesByCategory(category: string): ChatRepositoryResult<AssistantRole[]> {
  try {
    const db = getDb();
    const roles = db.prepare('SELECT * FROM assistant_roles WHERE category = ? AND is_active = true ORDER BY name').all(category) as AssistantRole[];
    return { success: true, data: roles };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error fetching roles by category' };
  }
}

export function updateAssistantRole(id: string, roleData: Partial<Omit<AssistantRole, 'id' | 'created_at' | 'updated_at'>>): ChatRepositoryResult<AssistantRole> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const fields = Object.keys(roleData);
    if (fields.length === 0) return { success: false, error: 'No fields to update' };
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values: any[] = fields.map(field => roleData[field as keyof typeof roleData]);
    values.push(now, id);
    const query = `UPDATE assistant_roles SET ${setClause}, updated_at = ? WHERE id = ?`;
    const result = db.prepare(query).run(...values);
    if (result.changes === 0) return { success: false, error: 'Assistant role not found or no changes made' };
    return getAssistantRoleById(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error updating assistant role' };
  }
}

export function deleteAssistantRole(id: string): ChatRepositoryResult<void> {
  try {
    const db = getDb();
    const existingRole = db.prepare('SELECT * FROM assistant_roles WHERE id = ?').get(id) as AssistantRole | undefined;
    if (!existingRole) return { success: false, error: 'Assistant role not found' };
    const result = db.prepare('DELETE FROM assistant_roles WHERE id = ?').run(id);
    if (result.changes === 0) return { success: false, error: 'Failed to delete assistant role' };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error deleting assistant role' };
  }
}

export function resetAssistantRole(id: string): ChatRepositoryResult<AssistantRole> {
  try {
    const defaultRole = DEFAULT_ASSISTANT_ROLES.find(r => r.id === id);
    if (!defaultRole) return { success: false, error: 'Role has no default values to reset to' };
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE assistant_roles
      SET name = ?, description = ?, icon = ?, system_prompt = ?, category = ?, color = ?, updated_at = ?
      WHERE id = ?
    `).run(defaultRole.name, defaultRole.description, defaultRole.icon, defaultRole.system_prompt, defaultRole.category, defaultRole.color, now, id);
    if (result.changes === 0) return { success: false, error: 'Assistant role not found' };
    return getAssistantRoleById(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error resetting assistant role' };
  }
}

export function resetAllAssistantRoles(): ChatRepositoryResult<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const upsert = db.prepare(`
      INSERT INTO assistant_roles (id, name, description, icon, system_prompt, category, color, is_active, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, description = excluded.description, icon = excluded.icon,
        system_prompt = excluded.system_prompt, category = excluded.category, color = excluded.color, updated_at = excluded.updated_at
    `);
    const transaction = db.transaction(() => {
      for (const role of DEFAULT_ASSISTANT_ROLES) {
        upsert.run(role.id, role.name, role.description, role.icon, role.system_prompt, role.category, role.color, now, now);
      }
    });
    transaction();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error resetting all assistant roles' };
  }
}

export function toggleAssistantRoleStatus(id: string): ChatRepositoryResult<AssistantRole> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`UPDATE assistant_roles SET is_active = NOT is_active, updated_at = ? WHERE id = ?`).run(now, id);
    if (result.changes === 0) return { success: false, error: 'Assistant role not found' };
    return getAssistantRoleById(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error toggling assistant role status' };
  }
}

export function updateConversationAssociatedFolder(conversationId: string, folderPath: string): ChatRepositoryResult<Conversation> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`UPDATE conversation SET associated_folder_path = ?, updated_at = ? WHERE id = ?`).run(folderPath, now, conversationId);
    if (result.changes === 0) return { success: false, error: 'Conversation not found' };
    return getConversation(conversationId);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error updating conversation associated folder' };
  }
}

export function removeConversationAssociatedFolder(conversationId: string): ChatRepositoryResult<Conversation> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare(`UPDATE conversation SET associated_folder_path = NULL, updated_at = ? WHERE id = ?`).run(now, conversationId);
    if (result.changes === 0) return { success: false, error: 'Conversation not found' };
    return getConversation(conversationId);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error removing conversation associated folder' };
  }
}
