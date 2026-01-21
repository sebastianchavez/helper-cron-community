export type ActionType =
  | 'write_file'
  | 'read_file'
  | 'delete_file'
  | 'run_command';

export interface BaseAction {
  id: string;
  type: ActionType;
}

export interface WriteFileAction extends BaseAction {
  type: 'write_file';
  path: string;
  content: string;
}

export interface ReadFileAction extends BaseAction {
  type: 'read_file';
  path: string;
}

export interface DeleteFileAction extends BaseAction {
  type: 'delete_file';
  path: string;
}

export interface RunCommandAction extends BaseAction {
  type: 'run_command';
  command: string;
  args?: string[];
}

export type Action =
  | WriteFileAction
  | ReadFileAction
  | DeleteFileAction
  | RunCommandAction;
