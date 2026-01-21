"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJobHandlers = registerJobHandlers;
const electron_1 = require("electron");
const action_executor_1 = require("../executor/action.executor");
const fs_1 = __importDefault(require("fs"));
function registerJobHandlers(win) {
    let currentJobId = '';
    let running = false;
    const send = (channel, payload) => {
        win.webContents.send(channel, payload);
    };
    const sendLog = (message, level = 'info') => {
        send('job:log', {
            timestamp: new Date().toISOString(),
            message,
            level,
        });
    };
    const sendStatus = (status) => {
        send('job:event', { type: 'status', data: status });
    };
    const updateActionStatus = (state, id, status) => state.map(a => (a.id === id ? { ...a, status } : a));
    // ================================
    // CLEAR JOB
    // ================================
    electron_1.ipcMain.handle('job:clear', async () => {
        if (running)
            return { ok: false };
        send('job:actions', []);
        sendStatus('idle');
        return { ok: true };
    });
    // ================================
    // RUN JOB
    // ================================
    electron_1.ipcMain.handle('job:run', async (_evt, payload) => {
        if (running) {
            return { ok: false, jobId: currentJobId };
        }
        console.log('Iniciando ejecución de job con acciones:', payload.actions);
        const { actions, projectRoot } = payload;
        running = true;
        currentJobId = `job-${Date.now()}`;
        let state = actions.map(a => ({
            ...a,
            status: 'pending',
        }));
        send('job:actions', state);
        sendStatus('running');
        sendLog(`▶ Iniciando ${currentJobId}`, 'info');
        if (!fs_1.default.existsSync(projectRoot)) {
            sendLog(`Project root no existe: ${projectRoot}`, 'error');
            return { ok: false, jobId: currentJobId };
        }
        try {
            for (const action of state) {
                // in-progress
                state = updateActionStatus(state, action.id, 'in-progress');
                send('job:actions', state);
                sendLog(`▶ Ejecutando ${action.type}`, 'info');
                await (0, action_executor_1.executeAction)(action, projectRoot, sendLog);
                // completed
                state = updateActionStatus(state, action.id, 'completed');
                send('job:actions', state);
                sendLog(`✔ Acción completada (${action.type})`, 'success');
            }
            sendStatus('completed');
            sendLog(`✔ Job completado: ${currentJobId}`, 'success');
            return { ok: true, jobId: currentJobId };
        }
        catch (e) {
            // marcar acción fallida
            state = updateActionStatus(state, state.find(a => a.status === 'in-progress')?.id, 'failed');
            send('job:actions', state);
            sendStatus('failed');
            sendLog(`✖ Job falló: ${e.message}`, 'error');
            return { ok: false, jobId: currentJobId };
        }
        finally {
            running = false;
        }
    });
}
