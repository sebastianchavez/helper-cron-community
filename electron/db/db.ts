import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { initUserProfileTable } from './user-profile.repository';

let db: Database.Database;

export function getDb() {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'chat.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL'); // mejor estabilidad/performance
  return db;
}

export function initDb() {
  const db = getDb();

  // Deshabilitar foreign keys temporalmente para migración
  db.pragma('foreign_keys = OFF');

  try {
    // Crear tabla folder primero
    db.exec(`
      CREATE TABLE IF NOT EXISTS folder (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Verificar si la tabla conversation tiene la columna folder_id
    const tableInfo = db.prepare(`PRAGMA table_info(conversation)`).all() as any[];
    const hasFolderId = tableInfo.some((col: any) => col.name === 'folder_id');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');

    if (!hasFolderId && tableInfo.length > 0) {
      // Migración: agregar columna folder_id a tabla existente
      console.log('Migrando base de datos: agregando folder_id...');
      
      try {
        // Agregar columna folder_id (permite NULL)
        db.exec(`ALTER TABLE conversation ADD COLUMN folder_id TEXT;`);
        console.log('Migración folder_id completada exitosamente');
      } catch (error) {
        console.error('Error agregando columna folder_id:', error);
        // Si falla el ALTER, recrear tabla
        db.exec(`
          CREATE TABLE conversation_new (
            id TEXT PRIMARY KEY,
            title TEXT,
            folder_id TEXT,
            deleted_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          
          INSERT INTO conversation_new (id, title, created_at, updated_at)
          SELECT id, title, created_at, updated_at FROM conversation;
          
          DROP TABLE conversation;
          
          ALTER TABLE conversation_new RENAME TO conversation;
        `);
        console.log('Tabla recreada exitosamente');
      }
    }
    
    if (!hasDeletedAt && tableInfo.length > 0) {
      // Migración: agregar columna deleted_at para soft delete
      console.log('Migrando base de datos: agregando deleted_at...');
      
      try {
        db.exec(`ALTER TABLE conversation ADD COLUMN deleted_at TEXT;`);
        console.log('Migración deleted_at completada exitosamente');
      } catch (error) {
        console.error('Error agregando columna deleted_at:', error);
      }
    }
    
    if (tableInfo.length === 0) {
      // Tabla no existe, crearla desde cero
      db.exec(`
        CREATE TABLE conversation (
          id TEXT PRIMARY KEY,
          title TEXT,
          folder_id TEXT,
          deleted_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    }

    // Crear tabla message si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS message (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Crear índices
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_message_conversation_created
      ON message(conversation_id, created_at);

      CREATE INDEX IF NOT EXISTS idx_conversation_folder
      ON conversation(folder_id);

      CREATE INDEX IF NOT EXISTS idx_folder_parent
      ON folder(parent_id);
    `);

    // Crear tabla de perfiles de usuario
    initUserProfileTable();

  } catch (error) {
    console.error('Error durante inicialización de BD:', error);
  } finally {
    // Reactivar foreign keys
    db.pragma('foreign_keys = ON');
  }
}
