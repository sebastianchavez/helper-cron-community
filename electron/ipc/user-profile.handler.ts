import { ipcMain } from 'electron';
import { getProfile, saveProfile, deleteProfile } from '../db/user-profile.repository';

export function setupUserProfileHandlers() {
  ipcMain.handle('user-profile:get', async () => {
    try {
      const profile = getProfile();
      return { success: true, data: profile };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: message };
    }
  });

  ipcMain.handle('user-profile:save', async (event, profile) => {
    try {
      const savedProfile = saveProfile(profile);
      return { success: true, data: savedProfile };
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: message };
    }
  });

  ipcMain.handle('user-profile:delete', async () => {
    try {
      deleteProfile();
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: message };
    }
  });
}