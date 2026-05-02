import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function registerFileWriteHandler() {
    ipcMain.handle('file:write-text', async (_event, filePath: string, content: string, options: any = {}) => {
        try {
            const resolvedPath = path.resolve(filePath);
            const dirPath = path.dirname(resolvedPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const fileExists = fs.existsSync(resolvedPath);

            if (fileExists && !options.overwrite) {
                return { success: false, error: 'File already exists', exists: true };
            }

            fs.writeFileSync(resolvedPath, content, 'utf8');
            const stats = fs.statSync(resolvedPath);

            return {
                success: true,
                filePath: resolvedPath,
                size: stats.size,
                created: !fileExists,
                updated: fileExists
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error writing file'
            };
        }
    });

    ipcMain.handle('file:read-text', async (_event, filePath: string) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { success: false, error: 'File does not exist' };
            }
            const content = fs.readFileSync(filePath, 'utf8');
            return { success: true, content };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error reading file'
            };
        }
    });
}
