import { getDb } from './db';
import * as crypto from 'crypto';

export interface UserProfile {
  id?: number;
  name: string;
  email?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export function initUserProfileTable() {
  const db = getDb();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function getProfile(): UserProfile | null {
  const db = getDb();
  const profile = db.prepare('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1').get() as UserProfile;
  return profile || null;
}

export function saveProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile {
  const db = getDb();
  
  // Verificar si ya existe un perfil
  const existingProfile = getProfile();
  
  if (existingProfile) {
    // Actualizar perfil existente
    const stmt = db.prepare(`
      UPDATE user_profile 
      SET name = ?, email = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(profileData.name, profileData.email || null, profileData.bio || null, existingProfile.id);
    
    return getProfile()!;
  } else {
    // Crear nuevo perfil
    const stmt = db.prepare(`
      INSERT INTO user_profile (name, email, bio)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(profileData.name, profileData.email || null, profileData.bio || null);
    
    return getProfile()!;
  }
}

export function deleteProfile(): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM user_profile');
  const result = stmt.run();
  
  return result.changes > 0;
}