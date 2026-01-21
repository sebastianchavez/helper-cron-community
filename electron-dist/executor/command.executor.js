"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSafeCommand = runSafeCommand;
const child_process_1 = require("child_process");
const command_whitelist_1 = require("../security/command-whitelist");
function runSafeCommand(command, args, cwd, onLog) {
    return new Promise((resolve, reject) => {
        if (!command_whitelist_1.COMMAND_WHITELIST[command]) {
            return reject(new Error(`Comando no permitido: ${command}`));
        }
        const allowedArgs = command_whitelist_1.COMMAND_WHITELIST[command].allowedArgs;
        if (allowedArgs) {
            for (const arg of args) {
                if (!allowedArgs.some(r => r.test(arg))) {
                    return reject(new Error(`Argumento no permitido: ${arg}`));
                }
            }
        }
        const child = (0, child_process_1.spawn)(command, args, {
            cwd,
            shell: false,
            stdio: 'pipe',
        });
        child.stdout.on('data', d => onLog(d.toString(), 'info'));
        child.stderr.on('data', d => onLog(d.toString(), 'error'));
        child.on('close', code => {
            if (code === 0) {
                onLog(`Comando completado: ${command}`, 'success');
                resolve();
            }
            else {
                reject(new Error(`Exit code ${code}`));
            }
        });
    });
}
