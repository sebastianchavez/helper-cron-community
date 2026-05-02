import { ipcMain } from 'electron';
import {
  listExecutionLogs,
  listExecutionLogsByFlow,
} from '../db/execution-log.repository';

export function registerExecutionLogHandlers() {
  ipcMain.handle('executionLog:listByRange', (_event, from: string, to: string) => {
    return listExecutionLogs(from, to);
  });

  ipcMain.handle('executionLog:listByFlow', (_event, flowId: string, limit?: number) => {
    return listExecutionLogsByFlow(flowId, limit);
  });
}
