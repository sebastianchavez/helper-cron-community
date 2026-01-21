import { Injectable } from '@angular/core';
import { ExecutionEnginePort } from '../../ports/execution-engine.port';
import { ActionExecution } from '../../models/action-execution.model';
import { BehaviorSubject } from 'rxjs';
import { LogEntry } from '../../models/log-entry.model';
import { ProjectService } from '../project/project.service';
declare var electron: any;

@Injectable({
  providedIn: 'root'
})
export class ElectronExecutionEngineService implements ExecutionEnginePort {
private actionsSubject = new BehaviorSubject<any[]>([]);
  private logsSubject = new BehaviorSubject<any[]>([]);
  private statusSubject = new BehaviorSubject<'idle' | 'running' | 'completed' | 'failed'>('idle');

  actions$ = this.actionsSubject.asObservable();
  logs$ = this.logsSubject.asObservable();
  jobStatus$ = this.statusSubject.asObservable();

  private unsubscribers: Array<() => void> = [];

  constructor(private projectService: ProjectService) {
    if (!window.agi) return;

    this.unsubscribers.push(
      window.agi.onJobActions((actions) => this.actionsSubject.next(actions)),
      window.agi.onJobLog((log) => this.logsSubject.next([...this.logsSubject.value, log])),
      window.agi.onJobEvent((evt) => {
        if (evt?.type === 'status') this.statusSubject.next(evt.data);
      }),
    );
  }

  async run(actions: any[]) {
    if (!window.agi) throw new Error('Electron API not available');
    const project = this.projectService.getActiveProject();
    if (!project) {
      throw new Error('No project selected');
    }

    await window.agi.runJob({
      actions,
      projectRoot: project.rootPath,
    });
  }

  async clear() {
    if (!window.agi) return;
    await window.agi.clearJob();
    this.actionsSubject.next([]);
    this.logsSubject.next([]);
    this.statusSubject.next('idle');
  }

  destroy() {
    this.unsubscribers.forEach(u => u());
    this.unsubscribers = [];
  }

}
