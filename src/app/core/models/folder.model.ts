export interface Folder {
  id: string;
  name: string;
  parent_id: string | null; // null para carpetas raíz
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
  conversation_count?: number;
}
