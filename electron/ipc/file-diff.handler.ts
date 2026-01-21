import fs from 'fs/promises';
import path from 'path';
import { ipcMain } from 'electron';
import { resolveSafePath } from '../security/path.utils';

export function registerFileDiffHandler() {
  ipcMain.handle(
    'file:diff',
    async (_evt, payload: { projectRoot: string; path: string; content: string }) => {
      const filePath = resolveSafePath(payload.projectRoot, payload.path);

      let before: string | null = null;

      try {
        before = await fs.readFile(filePath, 'utf-8');
      } catch {
        before = null; // archivo no existe
      }

      return {
        before,
        after: payload.content,
      };
    }
  );
}
