"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFolderHandlers = registerFolderHandlers;
const electron_1 = require("electron");
const folder_repository_1 = require("../db/folder.repository");
function registerFolderHandlers() {
    electron_1.ipcMain.handle('folder:create', (_event, name, parentId) => {
        return (0, folder_repository_1.createFolder)(name, parentId);
    });
    electron_1.ipcMain.handle('folder:list', (_event, parentId) => {
        return (0, folder_repository_1.listFolders)(parentId);
    });
    electron_1.ipcMain.handle('folder:tree', () => {
        return (0, folder_repository_1.getFolderTree)();
    });
    electron_1.ipcMain.handle('folder:get-by-id', (_event, id) => {
        return (0, folder_repository_1.getFolderById)(id);
    });
    electron_1.ipcMain.handle('folder:update', (_event, id, name) => {
        (0, folder_repository_1.updateFolder)(id, name);
    });
    electron_1.ipcMain.handle('folder:delete', (_event, id) => {
        (0, folder_repository_1.deleteFolder)(id);
    });
    electron_1.ipcMain.handle('folder:move', (_event, folderId, newParentId) => {
        (0, folder_repository_1.moveFolder)(folderId, newParentId);
    });
    electron_1.ipcMain.handle('folder:get-with-count', () => {
        return (0, folder_repository_1.getFoldersWithConversationCount)();
    });
}
