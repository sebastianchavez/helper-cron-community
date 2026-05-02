import { getDb } from './db';
import crypto from 'crypto';

export interface FlowRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  blocks_count: number;
  // Flow canvas data (JSON strings)
  canvas_blocks: string;
  connections: string;
  end_nodes: string;
  start_node_x: number;
  start_node_y: number;
  // Schedule
  schedule_type: 'interval' | 'specific';
  interval_value: number;
  interval_unit: 'minutes' | 'hours' | 'days';
  specific_time: string;
  selected_days: string; // JSON string { mon: boolean, ... }
  enabled: number; // 0 or 1
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export function initFlowTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS flow (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'route',
      icon_color TEXT NOT NULL DEFAULT 'text-blue-600',
      icon_bg TEXT NOT NULL DEFAULT 'bg-blue-50 dark:bg-blue-900/30',
      blocks_count INTEGER NOT NULL DEFAULT 0,
      canvas_blocks TEXT DEFAULT '[]',
      connections TEXT DEFAULT '[]',
      end_nodes TEXT DEFAULT '[]',
      start_node_x REAL DEFAULT 84,
      start_node_y REAL DEFAULT 40,
      schedule_type TEXT DEFAULT 'interval',
      interval_value INTEGER DEFAULT 30,
      interval_unit TEXT DEFAULT 'minutes',
      specific_time TEXT DEFAULT '09:00',
      selected_days TEXT DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}',
      enabled INTEGER DEFAULT 0,
      last_run_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Migration: add new columns to existing tables
  const tableInfo = db.prepare(`PRAGMA table_info(flow)`).all() as any[];
  const cols = tableInfo.map((c: any) => c.name);

  const migrations: { col: string; sql: string }[] = [
    { col: 'canvas_blocks', sql: `ALTER TABLE flow ADD COLUMN canvas_blocks TEXT DEFAULT '[]'` },
    { col: 'connections', sql: `ALTER TABLE flow ADD COLUMN connections TEXT DEFAULT '[]'` },
    { col: 'end_nodes', sql: `ALTER TABLE flow ADD COLUMN end_nodes TEXT DEFAULT '[]'` },
    { col: 'start_node_x', sql: `ALTER TABLE flow ADD COLUMN start_node_x REAL DEFAULT 84` },
    { col: 'start_node_y', sql: `ALTER TABLE flow ADD COLUMN start_node_y REAL DEFAULT 40` },
    { col: 'schedule_type', sql: `ALTER TABLE flow ADD COLUMN schedule_type TEXT DEFAULT 'interval'` },
    { col: 'interval_value', sql: `ALTER TABLE flow ADD COLUMN interval_value INTEGER DEFAULT 30` },
    { col: 'interval_unit', sql: `ALTER TABLE flow ADD COLUMN interval_unit TEXT DEFAULT 'minutes'` },
    { col: 'specific_time', sql: `ALTER TABLE flow ADD COLUMN specific_time TEXT DEFAULT '09:00'` },
    { col: 'selected_days', sql: `ALTER TABLE flow ADD COLUMN selected_days TEXT DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}'` },
    { col: 'enabled', sql: `ALTER TABLE flow ADD COLUMN enabled INTEGER DEFAULT 0` },
    { col: 'last_run_at', sql: `ALTER TABLE flow ADD COLUMN last_run_at TEXT` },
  ];

  for (const m of migrations) {
    if (!cols.includes(m.col)) {
      try { db.exec(m.sql); console.log(`[DB] Added column flow.${m.col}`); } catch (e) { /* already exists */ }
    }
  }
}

export function createFlow(data: {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
}): FlowRow {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO flow (id, name, description, icon, icon_color, icon_bg, blocks_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    data.name,
    data.description ?? '',
    data.icon ?? 'route',
    data.iconColor ?? 'text-blue-600',
    data.iconBg ?? 'bg-blue-50 dark:bg-blue-900/30',
    now,
    now
  );

  return getFlowById(id)!;
}

const FLOW_SELECT = `SELECT id, name, description, icon, icon_color, icon_bg, blocks_count,
  canvas_blocks, connections, end_nodes, start_node_x, start_node_y,
  schedule_type, interval_value, interval_unit, specific_time, selected_days,
  enabled, last_run_at, folder_id, created_at, updated_at FROM flow`;

export function listFlows(): FlowRow[] {
  const db = getDb();
  return db.prepare(`${FLOW_SELECT} ORDER BY updated_at DESC`).all() as FlowRow[];
}

export function getFlowById(id: string): FlowRow | undefined {
  const db = getDb();
  return db.prepare(`${FLOW_SELECT} WHERE id = ?`).get(id) as FlowRow | undefined;
}

export function listEnabledFlows(): FlowRow[] {
  const db = getDb();
  return db.prepare(`${FLOW_SELECT} WHERE enabled = 1 ORDER BY updated_at DESC`).all() as FlowRow[];
}

export function updateFlow(id: string, data: {
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
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const current = getFlowById(id);
  if (!current) return;

  db.prepare(`
    UPDATE flow
    SET name = ?, description = ?, icon = ?, icon_color = ?, icon_bg = ?, blocks_count = ?,
        canvas_blocks = ?, connections = ?, end_nodes = ?,
        start_node_x = ?, start_node_y = ?,
        schedule_type = ?, interval_value = ?, interval_unit = ?,
        specific_time = ?, selected_days = ?, enabled = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    data.name ?? current.name,
    data.description ?? current.description,
    data.icon ?? current.icon,
    data.iconColor ?? current.icon_color,
    data.iconBg ?? current.icon_bg,
    data.blocksCount ?? current.blocks_count,
    data.canvasBlocks ?? current.canvas_blocks,
    data.connections ?? current.connections,
    data.endNodes ?? current.end_nodes,
    data.startNodeX ?? current.start_node_x,
    data.startNodeY ?? current.start_node_y,
    data.scheduleType ?? current.schedule_type,
    data.intervalValue ?? current.interval_value,
    data.intervalUnit ?? current.interval_unit,
    data.specificTime ?? current.specific_time,
    data.selectedDays ?? current.selected_days,
    data.enabled ?? current.enabled,
    now,
    id
  );
}

export function updateFlowLastRun(id: string) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`UPDATE flow SET last_run_at = ? WHERE id = ?`).run(now, id);
}

export function deleteFlow(id: string) {
  const db = getDb();
  db.prepare(`DELETE FROM flow WHERE id = ?`).run(id);
}

export function duplicateFlow(id: string): FlowRow | undefined {
  const original = getFlowById(id);
  if (!original) return undefined;

  const newFlow = createFlow({
    name: original.name + ' (Copy)',
    description: original.description,
    icon: original.icon,
    iconColor: original.icon_color,
    iconBg: original.icon_bg,
  });

  // Copy canvas data but keep disabled
  updateFlow(newFlow.id, {
    canvasBlocks: original.canvas_blocks,
    connections: original.connections,
    endNodes: original.end_nodes,
    startNodeX: original.start_node_x,
    startNodeY: original.start_node_y,
    scheduleType: original.schedule_type,
    intervalValue: original.interval_value,
    intervalUnit: original.interval_unit,
    specificTime: original.specific_time,
    selectedDays: original.selected_days,
    blocksCount: original.blocks_count,
    enabled: 0,
  });

  return getFlowById(newFlow.id);
}
