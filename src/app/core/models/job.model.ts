export interface Job {
  id: string;
  planId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
}
