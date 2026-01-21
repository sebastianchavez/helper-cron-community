"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUserProfileTable = initUserProfileTable;
exports.getProfile = getProfile;
exports.saveProfile = saveProfile;
exports.deleteProfile = deleteProfile;
const db_1 = require("./db");
function initUserProfileTable() {
    const db = (0, db_1.getDb)();
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
function getProfile() {
    const db = (0, db_1.getDb)();
    const profile = db.prepare('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1').get();
    return profile || null;
}
function saveProfile(profileData) {
    const db = (0, db_1.getDb)();
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
        return getProfile();
    }
    else {
        // Crear nuevo perfil
        const stmt = db.prepare(`
      INSERT INTO user_profile (name, email, bio)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(profileData.name, profileData.email || null, profileData.bio || null);
        return getProfile();
    }
}
function deleteProfile() {
    const db = (0, db_1.getDb)();
    const stmt = db.prepare('DELETE FROM user_profile');
    const result = stmt.run();
    return result.changes > 0;
}
