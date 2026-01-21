"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFileDiffHandler = registerFileDiffHandler;
const promises_1 = __importDefault(require("fs/promises"));
const electron_1 = require("electron");
const path_utils_1 = require("../security/path.utils");
function registerFileDiffHandler() {
    electron_1.ipcMain.handle('file:diff', async (_evt, payload) => {
        const filePath = (0, path_utils_1.resolveSafePath)(payload.projectRoot, payload.path);
        let before = null;
        try {
            before = await promises_1.default.readFile(filePath, 'utf-8');
        }
        catch {
            before = null; // archivo no existe
        }
        return {
            before,
            after: payload.content,
        };
    });
}
