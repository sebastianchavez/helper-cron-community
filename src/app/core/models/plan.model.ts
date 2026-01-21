export interface Plan {
  id: string;
  goal: string;
  actions: PlannedAction[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface PlannedAction {
  id: string;
  verb: 'create' | 'update' | 'delete' | 'read';
  title: string;
  type: 'write_file' | 'read_file' | 'delete_file' | 'run_command';
  path?: string;
  content?: string;
  command?: string;
  args?: string[];
}

