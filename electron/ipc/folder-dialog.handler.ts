import { ipcMain, dialog } from 'electron';

export function registerFolderDialogHandler() {
    ipcMain.handle('folder:select-dialog', async () => {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Seleccionar carpeta de trabajo',
                properties: ['openDirectory'],
                buttonLabel: 'Seleccionar'
            });

            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, canceled: true };
            }

            const folderPath = result.filePaths[0];
            const formattedPath = process.platform === 'win32'
                ? folderPath.replace(/\//g, '\\')
                : folderPath;

            return { success: true, folderPath: formattedPath };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error opening folder dialog'
            };
        }
    });
}
