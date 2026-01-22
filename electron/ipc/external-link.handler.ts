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
}