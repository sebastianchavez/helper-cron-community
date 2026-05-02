import { ipcMain } from 'electron';
import {
  createFlow,
  listFlows,
  getFlowById,
  updateFlow,
  deleteFlow,
  duplicateFlow,
} from '../db/flow.repository';

export function registerFlowHandlers() {
  ipcMain.handle('flow:list', () => {
    return listFlows();
  });

  ipcMain.handle('flow:get', (_event, id: string) => {
    return getFlowById(id);
  });

  ipcMain.handle('flow:create', (_event, data: {
    name: string;
    description?: string;
    icon?: string;
    iconColor?: string;
    iconBg?: string;
  }) => {
    return createFlow(data);
  });

  ipcMain.handle('flow:update', (_event, id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    iconColor?: string;
    iconBg?: string;
    blocksCount?: number;
    canvasBlocks?: string;
    connections?: string;
    endNodes?: string;
    startNodeX?: number;
    startNodeY?: number;
    scheduleType?: string;
    intervalValue?: number;
    intervalUnit?: string;
    specificTime?: string;
    selectedDays?: string;
    enabled?: number;
  }) => {
    updateFlow(id, data);
    return getFlowById(id);
  });

  ipcMain.handle('flow:delete', (_event, id: string) => {
    deleteFlow(id);
  });

  ipcMain.handle('flow:duplicate', (_event, id: string) => {
    return duplicateFlow(id);
  });
}
