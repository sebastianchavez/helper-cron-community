export type ActionVerb = 'create' | 'update' | 'delete' | 'read';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface ActionExecution {
  id: string;
  verb: ActionVerb;
  title: string;
  status: ActionStatus;
}
