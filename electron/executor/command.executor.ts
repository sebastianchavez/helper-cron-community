import { spawn } from 'child_process';
import { COMMAND_WHITELIST } from '../security/command-whitelist';

export function runSafeCommand(
  command: string,
  args: string[],
  cwd: string,
  onLog: (msg: string, level?: 'info' | 'success' | 'error') => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!COMMAND_WHITELIST[command]) {
      return reject(new Error(`Comando no permitido: ${command}`));
    }

    const allowedArgs = COMMAND_WHITELIST[command].allowedArgs;
    if (allowedArgs) {
      for (const arg of args) {
        if (!allowedArgs.some(r => r.test(arg))) {
          return reject(new Error(`Argumento no permitido: ${arg}`));
        }
      }
    }

    const child = spawn(command, args, {
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
      } else {
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}
