import { Observable } from "rxjs";
import { ActionExecution } from "../models/action-execution.model";
import { LogEntry } from "../models/log-entry.model";

export interface ExecutionEnginePort {
  run(actions: ActionExecution[]): void;
  actions$: Observable<ActionExecution[]>;
  logs$: Observable<LogEntry[]>;
  jobStatus$: Observable<'idle' | 'running' | 'completed' | 'failed'>;
}
