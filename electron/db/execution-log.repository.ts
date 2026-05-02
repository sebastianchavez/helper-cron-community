import { getDb } from './db';
import crypto from 'crypto';

export interface ExecutionLogRow {
  id: string;
  flow_id: string;
  flow_name: string;
  success: number; // 0 or 1
  error: string | null;
  logs_json: string; // JSON string of log entries
  executed_at: string; // ISO string – exact execution timestamp
  duration_ms: number;
}

export function initExecutionLogTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS execution_log (
      id TEXT PRIMARY KEY,
      flow_id TEXT NOT NULL,
      flow_name TEXT NOT NULL,
      success INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      logs_json TEXT DEFAULT '[]',
      executed_at TEXT NOT NULL,
      duration_ms INTEGER DEFAULT 0
    );
  `);

  // Create index for date-range queries
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_execution_log_date ON execution_log (executed_at);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_execution_log_flow ON execution_log (flow_id);`);
  } catch (_) { /* already exists */ }
}

export function insertExecutionLog(data: {
  flowId: string;
  flowName: string;
  success: boolean;
  error?: string;
  logsJson: string;
  executedAt: string;
  durationMs: number;
}): ExecutionLogRow {
  const db = getDb();
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO execution_log (id, flow_id, flow_name, success, error, logs_json, executed_at, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.flowId,
    data.flowName,
    data.success ? 1 : 0,
    data.error ?? null,
    data.logsJson,
    data.executedAt,
    data.durationMs
  );

  return getExecutionLogById(id)!;
}

export function getExecutionLogById(id: string): ExecutionLogRow | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM execution_log WHERE id = ?`).get(id) as ExecutionLogRow | undefined;
}

/**
 * List execution logs within a date range (ISO strings).
 * Used by the calendar to show logs for a month/day/year.
 */
export function listExecutionLogs(from: string, to: string): ExecutionLogRow[] {
  const db = getDb();
  return db.prepare(
    `SELECT * FROM execution_log WHERE executed_at >= ? AND executed_at <= ? ORDER BY executed_at DESC`
  ).all(from, to) as ExecutionLogRow[];
}

/**
 * List execution logs for a specific flow.
 */
export function listExecutionLogsByFlow(flowId: string, limit = 50): ExecutionLogRow[] {
  const db = getDb();
  return db.prepare(
    `SELECT * FROM execution_log WHERE flow_id = ? ORDER BY executed_at DESC LIMIT ?`
  ).all(flowId, limit) as ExecutionLogRow[];
}

/**
 * Delete logs older than a given date.
 */
export function deleteOldExecutionLogs(before: string): number {
  const db = getDb();
  const result = db.prepare(`DELETE FROM execution_log WHERE executed_at < ?`).run(before);
  return result.changes;
}
