"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUserProfileHandlers = setupUserProfileHandlers;
const electron_1 = require("electron");
const user_profile_repository_1 = require("../db/user-profile.repository");
function setupUserProfileHandlers() {
    electron_1.ipcMain.handle('user-profile:get', async () => {
        try {
            const profile = (0, user_profile_repository_1.getProfile)();
            return { success: true, data: profile };
        }
        catch (error) {
            console.error('Error al obtener perfil:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return { success: false, error: message };
        }
    });
    electron_1.ipcMain.handle('user-profile:save', async (event, profile) => {
        try {
            const savedProfile = (0, user_profile_repository_1.saveProfile)(profile);
            return { success: true, data: savedProfile };
        }
        catch (error) {
            console.error('Error al guardar perfil:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return { success: false, error: message };
        }
    });
    electron_1.ipcMain.handle('user-profile:delete', async () => {
        try {
            (0, user_profile_repository_1.deleteProfile)();
            return { success: true };
        }
        catch (error) {
            console.error('Error al eliminar perfil:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return { success: false, error: message };
        }
    });
}
