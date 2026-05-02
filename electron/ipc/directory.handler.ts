import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function registerDirectoryHandler() {
    ipcMain.handle('directory:list-contents', async (_event, dirPath: string) => {
        try {
            if (!fs.existsSync(dirPath)) {
                return { success: false, error: 'Directory does not exist' };
            }

            const items = fs.readdirSync(dirPath);
            const contents = [];

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);
                contents.push({
                    name: item,
                    isDirectory: stats.isDirectory(),
                    isFile: stats.isFile(),
                    size: stats.size,
                    modified: stats.mtime,
                    extension: stats.isFile() ? path.extname(item) : null
                });
            }

            contents.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });

            return {
                success: true,
                contents: contents,
                totalItems: contents.length,
                directories: contents.filter(item => item.isDirectory).length,
                files: contents.filter(item => item.isFile).length
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error reading directory'
            };
        }
    });
}
