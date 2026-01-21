import { BrowserWindow, ipcMain } from 'electron';
import { executeAction } from '../executor/action.executor';
import { Action } from './action.types';
import fs from 'fs';

type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

type ActionExecutionState = Action & {
  status: ActionStatus;
};


export function registerJobHandlers(win: BrowserWindow) {
  let currentJobId = '';
  let running = false;

  const send = (channel: string, payload: any) => {
    win.webContents.send(channel, payload);
  };

  const sendLog = (
    message: string,
    level: 'info' | 'success' | 'error' = 'info',
  ) => {
    send('job:log', {
      timestamp: new Date().toISOString(),
      message,
      level,
    });
  };

  const sendStatus = (status: 'idle' | 'running' | 'completed' | 'failed') => {
    send('job:event', { type: 'status', data: status });
  };

  const updateActionStatus = (
    state: ActionExecutionState[],
    id: string,
    status: ActionStatus,
  ) =>
    state.map(a => (a.id === id ? { ...a, status } : a));

  // ================================
  // CLEAR JOB
  // ================================
  ipcMain.handle('job:clear', async () => {
    if (running) return { ok: false };

    send('job:actions', []);
    sendStatus('idle');

    return { ok: true };
  });

  // ================================
  // RUN JOB
  // ================================
  ipcMain.handle('job:run', async (_evt, payload: { actions: Action[]; projectRoot: string }) => {
    if (running) {
      return { ok: false, jobId: currentJobId };
    }

    console.log('Iniciando ejecución de job con acciones:', payload.actions);
      
    const { actions, projectRoot } = payload;
    running = true;
    currentJobId = `job-${Date.now()}`;

    let state: ActionExecutionState[] = actions.map(a => ({
      ...a,
      status: 'pending',
    }));

    send('job:actions', state);
    sendStatus('running');
    sendLog(`▶ Iniciando ${currentJobId}`, 'info');

     if (!fs.existsSync(projectRoot)) {
        sendLog(`Project root no existe: ${projectRoot}`, 'error');
        return { ok: false, jobId: currentJobId };
    }

    try {
      for (const action of state) {
        // in-progress
        state = updateActionStatus(state, action.id, 'in-progress');
        send('job:actions', state);
        sendLog(`▶ Ejecutando ${action.type}`, 'info');

        await executeAction(action, projectRoot, sendLog);

        // completed
        state = updateActionStatus(state, action.id, 'completed');
        send('job:actions', state);
        sendLog(`✔ Acción completada (${action.type})`, 'success');
      }

      sendStatus('completed');
      sendLog(`✔ Job completado: ${currentJobId}`, 'success');

      return { ok: true, jobId: currentJobId };
    } catch (e: any) {
      // marcar acción fallida
      state = updateActionStatus(state, state.find(a => a.status === 'in-progress')?.id!, 'failed');
      send('job:actions', state);

      sendStatus('failed');
      sendLog(`✖ Job falló: ${e.message}`, 'error');

      return { ok: false, jobId: currentJobId };
    } finally {
      running = false;
    }
  });
}
