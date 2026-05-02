/**
 * Flow executor for the Electron main process (FREE edition).
 * Runs flow blocks in sequence following connections, using node-fetch for API calls
 * and evaluating conditions. Returns a summary of the execution.
 */


import { Notification } from 'electron';
import { FlowRow, updateFlowLastRun } from '../db/flow.repository';
import { insertExecutionLog } from '../db/execution-log.repository';

export interface FlowBlock {
  id: string;
  type: string;
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  category: string;
  x: number;
  y: number;
  config?: { [key: string]: any };
}

export interface FlowConnection {
  from: string;
  to: string;
  outputPort?: string;
}

export interface FlowExecutionResult {
  success: boolean;
  flowName: string;
  logs: { time: string; type: 'info' | 'success' | 'error' | 'warn'; message: string }[];
  error?: string;
}

/**
 * Execute a flow from the database row.
 * Parses the canvas data and walks the graph from 'start'.
 */
export async function executeFlowFromDb(flow: FlowRow): Promise<FlowExecutionResult> {
  const logs: FlowExecutionResult['logs'] = [];
  const startTime = Date.now();
  const addLog = (type: 'info' | 'success' | 'error' | 'warn', message: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logs.push({ time, type, message });
  };

  try {
    const blocks: FlowBlock[] = JSON.parse(flow.canvas_blocks || '[]');
    const connections: FlowConnection[] = JSON.parse(flow.connections || '[]');

    const context: { [key: string]: any } = {};
    const variables: Record<string, any> = {};

    addLog('info', `▶ Flow started: "${flow.name}"`);

    // Find first connections from 'start'
    let currentIds = connections.filter(c => c.from === 'start').map(c => c.to);

    if (currentIds.length === 0) {
      addLog('warn', 'No connections from start node');
      addLog('error', 'Flow finished: no blocks to execute');
      return { success: false, flowName: flow.name, logs, error: 'No connections from start' };
    }

    const visited = new Set<string>();

    while (currentIds.length > 0) {
      const nextIds: string[] = [];

      for (const id of currentIds) {
        if (visited.has(id)) continue;
        visited.add(id);

        // End node reached
        if (id.startsWith('end-')) {
          addLog('success', `[${id}] End node reached`);
          continue;
        }

        const block = blocks.find(b => b.id === id);
        if (!block) continue;

        const label = block.label || block.type;
        addLog('info', `[${block.id}] Executing "${label}" (${block.type})`);

        // Resolve {{varName}} in all string config values before executing
        const resolvedBlock = resolveBlockVariables(block, variables);

        try {
          const result = await executeBlock(resolvedBlock, context, variables, addLog);

          // Store result in named variable if outputVar is set
          const outputVar = block.config?.['outputVar'];
          if (outputVar) {
            const rawValue = context['lastResult'] ?? result;
            const dotIdx = outputVar.indexOf('.');
            if (dotIdx !== -1) {
              const propPath = outputVar.substring(dotIdx + 1);
              const extracted = typeof rawValue === 'object' && rawValue !== null
                ? resolvePropertyPath(rawValue, propPath)
                : undefined;
              variables[outputVar] = extracted !== undefined ? extracted : rawValue;
            } else {
              variables[outputVar] = rawValue;
            }
            const outDisplay = typeof variables[outputVar] === 'object'
              ? JSON.stringify(variables[outputVar]).substring(0, 200)
              : String(variables[outputVar] ?? '').substring(0, 200);
            addLog('info', `[${block.id}] → variable "${outputVar}" = ${outDisplay}`);
          }

          if (block.type === 'api-rest') {
            const statusCode = context['lastStatus'] as number | undefined;
            let port: string;
            if (statusCode !== undefined && statusCode >= 200 && statusCode < 300) {
              port = '2xx';
            } else if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
              port = '4xx';
            } else if (statusCode !== undefined && statusCode >= 500) {
              port = '5xx';
            } else {
              port = '2xx';
            }
            addLog(port === '2xx' ? 'success' : 'error', `[${block.id}] → port: ${port}`);
            const outConns = connections.filter(c =>
              c.from === id && (c.outputPort === port || !c.outputPort)
            );
            for (const c of outConns) nextIds.push(c.to);
          } else {
            if (result !== undefined && result !== null) {
              const display = typeof result === 'object' ? JSON.stringify(result) : String(result);
              addLog('success', `[${block.id}] → ${display}`);
            } else {
              addLog('success', `[${block.id}] Done`);
            }
            const outConns = connections.filter(c => c.from === id);
            for (const c of outConns) nextIds.push(c.to);
          }
        } catch (err: any) {
          addLog('error', `[${block.id}] ERROR: ${err?.message || err}`);
        }
      }

      currentIds = nextIds;
    }

    addLog('info', `✓ Flow "${flow.name}" finished successfully`);
    updateFlowLastRun(flow.id);

    // Persist execution log
    try {
      insertExecutionLog({
        flowId: flow.id,
        flowName: flow.name,
        success: true,
        logsJson: JSON.stringify(logs),
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      });
    } catch (e) { console.error('[EXECUTOR] Failed to save execution log:', e); }

    return { success: true, flowName: flow.name, logs };
  } catch (err: any) {
    addLog('error', `Fatal error: ${err?.message || err}`);

    // Persist execution log for failure
    try {
      insertExecutionLog({
        flowId: flow.id,
        flowName: flow.name,
        success: false,
        error: err?.message || String(err),
        logsJson: JSON.stringify(logs),
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      });
    } catch (e) { console.error('[EXECUTOR] Failed to save execution log:', e); }

    return { success: false, flowName: flow.name, logs, error: err?.message };
  }
}

async function executeBlock(
  block: FlowBlock,
  context: { [key: string]: any },
  variables: Record<string, any>,
  addLog: (type: 'info' | 'success' | 'error' | 'warn', msg: string) => void
): Promise<any> {
  const config = block.config || {};

  switch (block.type) {
    // ── localStorage (in-memory store in main process) ──
    case 'local-storage': {
      const action = config['action'] || 'get';
      const key = config['key'] || '';
      const format = config['format'] || 'string';

      if (!key) {
        addLog('warn', `[${block.id}] No key specified`);
        return undefined;
      }

      if (action === 'get') {
        const raw = context[`_store_${key}`] ?? null;
        let parsed: any = raw;
        if (raw !== null && format === 'json') {
          try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        }
        context['lastResult'] = parsed;
        return parsed === null ? `${key} = null` : `${key} = ${typeof parsed === 'object' ? JSON.stringify(parsed) : parsed}`;
      } else {
        const value = config['value'] ?? '';
        context[`_store_${key}`] = value;
        context['lastResult'] = value;
        return `${key} ← ${value || '""'}`;
      }
    }

    // ── wait ──
    case 'wait': {
      const ms = Number(config['duration']) || 1000;
      addLog('info', `[${block.id}] Waiting ${ms}ms`);
      await sleep(ms);
      return `${ms}ms`;
    }

    // ── api-rest ──
    case 'api-rest': {
      const method = (config['method'] || 'GET').toUpperCase();
      const url = config['url'] || '';
      const headersRaw = config['headers'] || '';
      const body = config['body'] || '';

      if (!url) {
        addLog('warn', `[${block.id}] No URL specified`);
        return undefined;
      }

      const headers: Record<string, string> = {};
      if (headersRaw.trim()) {
        for (const line of headersRaw.split('\n')) {
          const idx = line.indexOf(':');
          if (idx > 0) {
            headers[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
          }
        }
      }

      addLog('info', `[${block.id}] ${method} ${url}`);

      try {
        const fetchOpts: any = { method, headers };
        if (body && method !== 'GET' && method !== 'DELETE') {
          fetchOpts.body = body;
          if (!headers['Content-Type'] && !headers['content-type']) {
            headers['Content-Type'] = 'application/json';
          }
        }

        const resp = await fetch(url, fetchOpts);
        const respText = await resp.text();
        let data: any;
        try { data = JSON.parse(respText); } catch { data = respText; }
        context['lastResult'] = data;
        context['lastStatus'] = resp.status;
        addLog(resp.ok ? 'success' : 'warn', `[${block.id}] Status: ${resp.status} ${resp.statusText}`);
        const preview = typeof data === 'object' ? JSON.stringify(data).substring(0, 300) : String(data).substring(0, 300);
        return `${resp.status} | ${preview}`;
      } catch (err: any) {
        throw new Error(`Fetch failed: ${err?.message}`);
      }
    }

    // ── webhook (GET request to a URL) ──
    case 'webhook': {
      const url = config['url'] || '';
      if (!url) {
        addLog('warn', `[${block.id}] No URL specified`);
        return undefined;
      }
      addLog('info', `[${block.id}] → ${url}`);
      try {
        const resp = await fetch(url);
        const body = await resp.text();
        let data: any;
        try { data = JSON.parse(body); } catch { data = body; }
        context['lastResult'] = data;
        return { status: resp.status, data: typeof data === 'string' ? data.substring(0, 200) : data };
      } catch (err: any) {
        throw new Error(`Fetch failed: ${err?.message}`);
      }
    }

    // ── ai-prompt (call Ollama LLM) ──
    case 'ai-prompt': {
      const aiModel = config['model'] || '';
      const aiPrompt = config['prompt'] || '';

      if (!aiPrompt) {
        addLog('warn', `[${block.id}] No prompt specified for AI block`);
        return undefined;
      }

      try {
        const checkResp = await fetch('http://localhost:11434/api/tags');
        if (!checkResp.ok) {
          addLog('error', `[${block.id}] Ollama is not running (status ${checkResp.status})`);
          throw new Error('Ollama is not running');
        }
      } catch (checkErr: any) {
        if (checkErr?.message === 'Ollama is not running') throw checkErr;
        addLog('error', `[${block.id}] Ollama is not running or not reachable`);
        throw new Error('Ollama is not running or not reachable');
      }

      const messages: any[] = [];

      messages.push({ role: 'user', content: aiPrompt });

      addLog('info', `[${block.id}] 🤖 Sending AI prompt${aiModel ? ' (' + aiModel + ')' : ''}...`);

      try {
        const resp = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiModel || 'llama3.2',
            messages,
            stream: false
          })
        });

        if (!resp.ok) {
          throw new Error(`Ollama returned status ${resp.status}`);
        }

        const json = await resp.json();
        const content = json?.message?.content || '';
        context['lastResult'] = content;

        const preview = content.length > 300 ? content.substring(0, 300) + '...' : content;
        addLog('success', `[${block.id}] AI response: ${preview}`);
        return content;
      } catch (err: any) {
        throw new Error(`AI request failed: ${err?.message || err}`);
      }
    }

    // ── set-variable ──
    case 'set-variable': {
      let assignments: { name: string; value: string }[] = config['assignments'] as any[];
      if (!Array.isArray(assignments) || assignments.length === 0) {
        const name = config['varName'] || '';
        const value = config['varValue'] ?? '';
        assignments = name ? [{ name, value }] : [];
      }

      if (assignments.length === 0) {
        addLog('warn', `[${block.id}] No variable name specified`);
        return undefined;
      }

      let lastParsed: any;
      for (const a of assignments) {
        if (!a.name) continue;
        let parsedValue: any = a.value;
        if (typeof a.value === 'string' && a.value.trim().length > 0) {
          try { parsedValue = JSON.parse(a.value); } catch { /* keep as string */ }
        }
        variables[a.name] = parsedValue;
        lastParsed = parsedValue;

        const display = typeof parsedValue === 'object'
          ? JSON.stringify(parsedValue).substring(0, 150)
          : String(parsedValue).substring(0, 150);
        addLog('success', `[${block.id}] ${a.name} = ${display}`);
      }

      context['lastResult'] = lastParsed;
      return lastParsed;
    }

    // ── fork (split execution into multiple parallel paths) ──
    case 'fork': {
      addLog('info', `[${block.id}] 🔀 Fork — splitting execution into parallel paths`);
      const forkResult = context['lastResult'];
      return forkResult;
    }

    // ── join (synchronise parallel paths back into one) ──
    case 'join': {
      addLog('info', `[${block.id}] 🤝 Join — merging parallel paths`);
      const joinResult = context['lastResult'];
      return joinResult;
    }

    // ── generic / unknown ──
    default: {
      const name = config['name'] || block.type;
      context['lastResult'] = name;
      return name;
    }
  }
}

// ─── Utility functions ──────────────────────────────────────────────────────

function resolvePropertyPath(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function resolveVariables(text: string, variables: Record<string, any>): string {
  return text.replace(/\{\{([\w]+(?:\.[\w\[\]]+)*)\}\}/g, (_match, expr: string) => {
    const dotIdx = expr.indexOf('.');
    let val: any;
    if (dotIdx === -1) {
      val = variables[expr];
    } else {
      const varName = expr.substring(0, dotIdx);
      const path = expr.substring(dotIdx + 1);
      const root = variables[varName];
      val = resolvePropertyPath(root, path);
    }
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

function resolveBlockVariables(block: FlowBlock, variables: Record<string, any>): FlowBlock {
  if (!block.config) return block;
  const resolvedConfig: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(block.config)) {
    if (key === 'outputVar' || key === 'code') {
      resolvedConfig[key] = value;
    } else if (key === 'assignments' && Array.isArray(value)) {
      resolvedConfig[key] = value.map((a: any) => ({
        name: a.name,
        value: typeof a.value === 'string' ? resolveVariables(a.value, variables) : a.value
      }));
    } else if (typeof value === 'string') {
      resolvedConfig[key] = resolveVariables(value, variables);
    } else {
      resolvedConfig[key] = value;
    }
  }
  return { ...block, config: resolvedConfig };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show an OS notification with the flow execution result.
 */
export function showFlowNotification(result: FlowExecutionResult): void {
  const title = result.success
    ? `✅ ${result.flowName}`
    : `❌ ${result.flowName}`;

  const lastLogs = result.logs
    .filter(l => l.type === 'success' || l.type === 'error')
    .slice(-3)
    .map(l => l.message)
    .join('\n');

  const body = result.success
    ? lastLogs || 'Flow ejecutado correctamente'
    : result.error || lastLogs || 'Error en la ejecución del flow';

  const notification = new Notification({
    title,
    body: body.substring(0, 256),
  });

  notification.show();
}
