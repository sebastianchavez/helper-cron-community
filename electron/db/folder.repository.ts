import { getDb } from './db';
import crypto from 'crypto';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
  conversation_count?: number;
}

export function createFolder(name: string, parent_id?: string) {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO folder (id, name, parent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, parent_id ?? null, now, now);

  return { id, name, parent_id: parent_id ?? null, created_at: now, updated_at: now };
}

export function listFolders(parent_id?: string) {
  const db = getDb();
  const query = parent_id
    ? `SELECT id, name, parent_id, created_at, updated_at FROM folder WHERE parent_id = ? ORDER BY name ASC`
    : `SELECT id, name, parent_id, created_at, updated_at FROM folder WHERE parent_id IS NULL ORDER BY name ASC`;

  return db.prepare(query).all(parent_id ?? null) as Folder[];
}

export function getFolderTree() {
  const db = getDb();
  const folders = db.prepare(`
    SELECT id, name, parent_id, created_at, updated_at
    FROM folder
    ORDER BY parent_id, name ASC
  `).all() as Folder[];

  const buildTree = (parentId: string | null): FolderWithChildren[] => {
    return folders
      .filter((f) => f.parent_id === parentId)
      .map((f) => ({
        ...f,
        children: buildTree(f.id),
        conversation_count: getConversationCountInFolder(f.id),
      }));
  };

  return buildTree(null);
}

export function getFolderById(id: string) {
  const db = getDb();
  return db.prepare(`
    SELECT id, name, parent_id, created_at, updated_at
    FROM folder
    WHERE id = ?
  `).get(id) as Folder | undefined;
}

export function updateFolder(id: string, name: string) {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE folder
    SET name = ?, updated_at = ?
    WHERE id = ?
  `).run(name, now, id);
}

export function deleteFolder(id: string) {
  const db = getDb();

  const tx = db.transaction(() => {
    // Obtener todas las subcarpetas recursivamente
    const getAllSubfolders = (folderId: string): string[] => {
      const subfolders = db.prepare(`SELECT id FROM folder WHERE parent_id = ?`).all(folderId) as { id: string }[];
      let allIds = subfolders.map((f) => f.id);
      for (const subfolderId of subfolders) {
        allIds = allIds.concat(getAllSubfolders(subfolderId.id));
      }
      return allIds;
    };

    const allFolderIds = [id, ...getAllSubfolders(id)];

    // Eliminar mensajes de conversaciones en estas carpetas
    for (const folderId of allFolderIds) {
      const conversations = db.prepare(`SELECT id FROM conversation WHERE folder_id = ?`).all(folderId) as {
        id: string;
      }[];
      for (const conv of conversations) {
        db.prepare(`DELETE FROM message WHERE conversation_id = ?`).run(conv.id);
      }
      // Eliminar conversaciones
      db.prepare(`DELETE FROM conversation WHERE folder_id = ?`).run(folderId);
    }

    // Eliminar carpetas
    for (const folderId of allFolderIds) {
      db.prepare(`DELETE FROM folder WHERE id = ?`).run(folderId);
    }
  });

  tx();
}

export function moveFolder(folderId: string, newParentId?: string) {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE folder
    SET parent_id = ?, updated_at = ?
    WHERE id = ?
  `).run(newParentId ?? null, now, folderId);
}

export function getConversationCountInFolder(folderId: string) {
  const db = getDb();
  const result = db.prepare(`SELECT COUNT(*) as count FROM conversation WHERE folder_id = ? AND deleted_at IS NULL`).get(folderId) as {
    count: number;
  };
  return result.count;
}

export function getFoldersWithConversationCount() {
  const db = getDb();
  const folders = db.prepare(`
    SELECT f.id, f.name, f.parent_id, f.created_at, f.updated_at, COUNT(c.id) as conversation_count
    FROM folder f
    LEFT JOIN conversation c ON f.id = c.folder_id AND c.deleted_at IS NULL
    GROUP BY f.id
    ORDER BY f.parent_id, f.name ASC
  `).all() as (Folder & { conversation_count: number })[];

  return folders;
}
