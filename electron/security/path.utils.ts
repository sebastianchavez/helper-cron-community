import path from 'path';

export function resolveSafePath(root: string, target: string): string {
  const resolved = path.resolve(root, target);
  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error('Path fuera del proyecto');
  }
  return resolved;
}
