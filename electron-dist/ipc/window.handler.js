"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWindowHandlers = registerWindowHandlers;
const electron_1 = require("electron");
function registerWindowHandlers() {
    // Handler para mostrar la ventana
    electron_1.ipcMain.handle('window:show', async () => {
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        const targetWindow = allWindows.length > 0 ? allWindows[0] : null;
        if (targetWindow) {
            try {
                targetWindow.show();
                console.log('[WINDOW] Show window called successfully');
                return { success: true };
            }
            catch (error) {
                console.error('[WINDOW] Error showing window:', error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
        else {
            console.error('[WINDOW] No window found to show');
            return { success: false, error: 'No window found' };
        }
    });
    // Handler para restaurar la ventana
    electron_1.ipcMain.handle('window:restore', async () => {
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        const targetWindow = allWindows.length > 0 ? allWindows[0] : null;
        if (targetWindow) {
            try {
                if (targetWindow.isMinimized()) {
                    targetWindow.restore();
                }
                console.log('[WINDOW] Restore window called successfully');
                return { success: true };
            }
            catch (error) {
                console.error('[WINDOW] Error restoring window:', error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
        else {
            console.error('[WINDOW] No window found to restore');
            return { success: false, error: 'No window found' };
        }
    });
    // Handler para minimizar la ventana
    electron_1.ipcMain.handle('window:minimize', async () => {
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        const targetWindow = allWindows.length > 0 ? allWindows[0] : null;
        if (targetWindow) {
            try {
                targetWindow.minimize();
                console.log('[WINDOW] Minimize window called successfully');
                return { success: true };
            }
            catch (error) {
                console.error('[WINDOW] Error minimizing window:', error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
        else {
            console.error('[WINDOW] No window found to minimize');
            return { success: false, error: 'No window found' };
        }
    });
    // Handler para maximizar la ventana
    electron_1.ipcMain.handle('window:maximize', async () => {
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        const targetWindow = allWindows.length > 0 ? allWindows[0] : null;
        if (targetWindow) {
            try {
                if (targetWindow.isMaximized()) {
                    targetWindow.unmaximize();
                }
                else {
                    targetWindow.maximize();
                }
                console.log('[WINDOW] Maximize/unmaximize window called successfully');
                return { success: true };
            }
            catch (error) {
                console.error('[WINDOW] Error maximizing window:', error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
        else {
            console.error('[WINDOW] No window found to maximize');
            return { success: false, error: 'No window found' };
        }
    });
    // Handler para cerrar la ventana
    electron_1.ipcMain.handle('window:close', async () => {
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        const targetWindow = allWindows.length > 0 ? allWindows[0] : null;
        if (targetWindow) {
            try {
                targetWindow.close();
                console.log('[WINDOW] Close window called successfully');
                return { success: true };
            }
            catch (error) {
                console.error('[WINDOW] Error closing window:', error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
        else {
            console.error('[WINDOW] No window found to close');
            return { success: false, error: 'No window found' };
        }
    });
}
