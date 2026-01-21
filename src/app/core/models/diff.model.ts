export interface FileDiff {
  path: string;
  before: string | null; // null si no existe
  after: string;
}
