"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerExternalLinkHandler = registerExternalLinkHandler;
const electron_1 = require("electron");
function registerExternalLinkHandler() {
    electron_1.ipcMain.handle('open-external-link', async (event, url) => {
        try {
            // Validar que la URL sea segura
            const allowedDomains = ['ollama.com', 'github.com'];
            const parsedUrl = new URL(url);
            if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
                throw new Error('URL no permitida');
            }
            await electron_1.shell.openExternal(url);
            return { success: true };
        }
        catch (error) {
            console.error('Error opening external link:', error);
            return { success: false, error: error.message };
        }
    });
}
