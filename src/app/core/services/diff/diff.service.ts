import { Injectable } from '@angular/core';
import { PlannedAction } from '../../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class DiffService {
async getDiff(projectRoot: string, action: PlannedAction): Promise<{ before: string | null; after: string }> {
    if (!window.agi) throw new Error('Electron API not available');

    return window.agi.getFileDiff({
      projectRoot,
      path: action.path!,
      content: action.content!,
    });
  }
}
