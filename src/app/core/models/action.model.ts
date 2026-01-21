export interface UiAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'read';
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  target: string;
  timestamp: Date;
}
