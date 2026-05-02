import { ipcMain, shell } from 'electron';

export function registerExternalLinkHandler() {
    ipcMain.handle('open-external-link', async (event, url: string) => {
        try {
            // Validar que la URL sea segura
            const allowedDomains = ['ollama.com', 'github.com'];
            const parsedUrl = new URL(url);
            
            if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
                throw new Error('URL no permitida');
            }
            
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external link:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('show-item-in-folder', async (_event, filePath: string) => {
        try {
            const fs = require('fs');
            const exists = fs.existsSync(filePath);
            if (exists) {
                shell.showItemInFolder(filePath);
            } else {
                const path = require('path');
                const dir = path.dirname(filePath);
                await shell.openPath(dir);
            }
            return { success: true };
        } catch (error) {
            console.error('Error showing item in folder:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}