"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSafePath = resolveSafePath;
const path_1 = __importDefault(require("path"));
function resolveSafePath(root, target) {
    const resolved = path_1.default.resolve(root, target);
    if (!resolved.startsWith(path_1.default.resolve(root))) {
        throw new Error('Path fuera del proyecto');
    }
    return resolved;
}
