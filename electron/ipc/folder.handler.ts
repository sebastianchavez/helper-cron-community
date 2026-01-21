import { ipcMain } from 'electron';
import {
  createFolder,
  listFolders,
  getFolderTree,
  getFolderById,
  updateFolder,
  deleteFolder,
  moveFolder,
  getFoldersWithConversationCount,
} from '../db/folder.repository';

export function registerFolderHandlers() {
  ipcMain.handle('folder:create', (_event, name: string, parentId?: string) => {
    return createFolder(name, parentId);
  });

  ipcMain.handle('folder:list', (_event, parentId?: string) => {
    return listFolders(parentId);
  });

  ipcMain.handle('folder:tree', () => {
    return getFolderTree();
  });

  ipcMain.handle('folder:get-by-id', (_event, id: string) => {
    return getFolderById(id);
  });

  ipcMain.handle('folder:update', (_event, id: string, name: string) => {
    updateFolder(id, name);
  });

  ipcMain.handle('folder:delete', (_event, id: string) => {
    deleteFolder(id);
  });

  ipcMain.handle('folder:move', (_event, folderId: string, newParentId?: string) => {
    moveFolder(folderId, newParentId);
  });

  ipcMain.handle('folder:get-with-count', () => {
    return getFoldersWithConversationCount();
  });
}
