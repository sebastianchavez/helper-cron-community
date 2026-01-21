"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolder = createFolder;
exports.listFolders = listFolders;
exports.getFolderTree = getFolderTree;
exports.getFolderById = getFolderById;
exports.updateFolder = updateFolder;
exports.deleteFolder = deleteFolder;
exports.moveFolder = moveFolder;
exports.getConversationCountInFolder = getConversationCountInFolder;
exports.getFoldersWithConversationCount = getFoldersWithConversationCount;
const db_1 = require("./db");
const crypto_1 = __importDefault(require("crypto"));
function createFolder(name, parent_id) {
    const db = (0, db_1.getDb)();
    const id = crypto_1.default.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
    INSERT INTO folder (id, name, parent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, parent_id ?? null, now, now);
    return { id, name, parent_id: parent_id ?? null, created_at: now, updated_at: now };
}
function listFolders(parent_id) {
    const db = (0, db_1.getDb)();
    const query = parent_id
        ? `SELECT id, name, parent_id, created_at, updated_at FROM folder WHERE parent_id = ? ORDER BY name ASC`
        : `SELECT id, name, parent_id, created_at, updated_at FROM folder WHERE parent_id IS NULL ORDER BY name ASC`;
    return db.prepare(query).all(parent_id ?? null);
}
function getFolderTree() {
    const db = (0, db_1.getDb)();
    const folders = db.prepare(`
    SELECT id, name, parent_id, created_at, updated_at
    FROM folder
    ORDER BY parent_id, name ASC
  `).all();
    const buildTree = (parentId) => {
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
function getFolderById(id) {
    const db = (0, db_1.getDb)();
    return db.prepare(`
    SELECT id, name, parent_id, created_at, updated_at
    FROM folder
    WHERE id = ?
  `).get(id);
}
function updateFolder(id, name) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    db.prepare(`
    UPDATE folder
    SET name = ?, updated_at = ?
    WHERE id = ?
  `).run(name, now, id);
}
function deleteFolder(id) {
    const db = (0, db_1.getDb)();
    const tx = db.transaction(() => {
        // Obtener todas las subcarpetas recursivamente
        const getAllSubfolders = (folderId) => {
            const subfolders = db.prepare(`SELECT id FROM folder WHERE parent_id = ?`).all(folderId);
            let allIds = subfolders.map((f) => f.id);
            for (const subfolderId of subfolders) {
                allIds = allIds.concat(getAllSubfolders(subfolderId.id));
            }
            return allIds;
        };
        const allFolderIds = [id, ...getAllSubfolders(id)];
        // Eliminar mensajes de conversaciones en estas carpetas
        for (const folderId of allFolderIds) {
            const conversations = db.prepare(`SELECT id FROM conversation WHERE folder_id = ?`).all(folderId);
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
function moveFolder(folderId, newParentId) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    db.prepare(`
    UPDATE folder
    SET parent_id = ?, updated_at = ?
    WHERE id = ?
  `).run(newParentId ?? null, now, folderId);
}
function getConversationCountInFolder(folderId) {
    const db = (0, db_1.getDb)();
    const result = db.prepare(`SELECT COUNT(*) as count FROM conversation WHERE folder_id = ? AND deleted_at IS NULL`).get(folderId);
    return result.count;
}
function getFoldersWithConversationCount() {
    const db = (0, db_1.getDb)();
    const folders = db.prepare(`
    SELECT f.id, f.name, f.parent_id, f.created_at, f.updated_at, COUNT(c.id) as conversation_count
    FROM folder f
    LEFT JOIN conversation c ON f.id = c.folder_id AND c.deleted_at IS NULL
    GROUP BY f.id
    ORDER BY f.parent_id, f.name ASC
  `).all();
    return folders;
}
