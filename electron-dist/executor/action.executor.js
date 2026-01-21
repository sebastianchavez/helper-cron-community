"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAction = executeAction;
const promises_1 = __importDefault(require("fs/promises"));
const path_utils_1 = require("../security/path.utils");
const command_executor_1 = require("./command.executor");
async function executeAction(action, projectRoot, onLog) {
    switch (action.type) {
        case 'write_file': {
            const filePath = (0, path_utils_1.resolveSafePath)(projectRoot, action.path);
            await promises_1.default.mkdir(require('path').dirname(filePath), { recursive: true });
            await promises_1.default.writeFile(filePath, action.content, 'utf-8');
            onLog(`Archivo escrito: ${action.path}`, 'success');
            break;
        }
        case 'read_file': {
            const filePath = (0, path_utils_1.resolveSafePath)(projectRoot, action.path);
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            onLog(`Archivo leído: ${action.path}`, 'info');
            return content;
        }
        case 'delete_file': {
            const filePath = (0, path_utils_1.resolveSafePath)(projectRoot, action.path);
            await promises_1.default.unlink(filePath);
            onLog(`Archivo eliminado: ${action.path}`, 'success');
            break;
        }
        case 'run_command': {
            (0, command_executor_1.runSafeCommand)(action.command, action.args ?? [], projectRoot, onLog);
            break;
        }
    }
}
