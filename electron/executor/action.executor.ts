import fs from 'fs/promises';
import { spawn } from 'child_process';
import { Action } from '../ipc/action.types';
import { resolveSafePath } from '../security/path.utils';
import { COMMAND_WHITELIST } from '../security/command-whitelist';
import { runSafeCommand } from './command.executor';

export async function executeAction(
  action: Action,
  projectRoot: string,
  onLog: (msg: string, level?: 'info' | 'success' | 'error') => void,
) {
  switch (action.type) {
    case 'write_file': {
      const filePath = resolveSafePath(projectRoot, action.path);
      await fs.mkdir(require('path').dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, action.content, 'utf-8');
      onLog(`Archivo escrito: ${action.path}`, 'success');
      break;
    }

    case 'read_file': {
      const filePath = resolveSafePath(projectRoot, action.path);
      const content = await fs.readFile(filePath, 'utf-8');
      onLog(`Archivo leído: ${action.path}`, 'info');
      return content;
    }

    case 'delete_file': {
      const filePath = resolveSafePath(projectRoot, action.path);
      await fs.unlink(filePath);
      onLog(`Archivo eliminado: ${action.path}`, 'success');
      break;
    }

    case 'run_command': {
      runSafeCommand(action.command, action.args ?? [], projectRoot, onLog);
      break;
    }
  }
}
