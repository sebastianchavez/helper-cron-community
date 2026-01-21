export interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'success' | 'error';
}
