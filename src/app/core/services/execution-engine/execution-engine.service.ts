import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, delay, from, map, Observable, of, tap } from 'rxjs';
import { ActionExecution, ActionStatus } from '../../models/action-execution.model';
import { LogEntry } from '../../models/log-entry.model';

@Injectable({
  providedIn: 'root'
})
export class ExecutionEngineService {
private actionsSubject = new BehaviorSubject<ActionExecution[]>([]);
  private logsSubject = new BehaviorSubject<LogEntry[]>([]);
  private jobStatusSubject = new BehaviorSubject<'idle' | 'running' | 'completed' | 'failed'>('idle');

  actions$ = this.actionsSubject.asObservable();
  logs$ = this.logsSubject.asObservable();
  jobStatus$ = this.jobStatusSubject.asObservable();

  run(actions: ActionExecution[]) {
    this.actionsSubject.next(actions);
    this.logsSubject.next([]);
    this.jobStatusSubject.next('running');

    from(actions)
      .pipe(concatMap(action => this.executeAction(action)))
      .subscribe({
        complete: () => this.jobStatusSubject.next('completed'),
        error: () => this.jobStatusSubject.next('failed'),
      });
  }

  private executeAction(action: ActionExecution): Observable<void> {
    return of(null).pipe(
      tap(() => this.updateAction(action.id, 'in-progress')),
      tap(() => this.log(`▶ ${action.title}`, 'info')),
      delay(1200),
      tap(() => {
        // Simulación de error
        if (action.title.includes('UI')) {
          this.updateAction(action.id, 'failed');
          this.log(`✖ Error ejecutando: ${action.title}`, 'error');
          throw new Error('Execution failed');
        }

        this.updateAction(action.id, 'completed');
        this.log(`✔ ${action.title}`, 'success');
      }),
      map(() => void 0),
    );
  }

  private updateAction(id: string, status: ActionStatus) {
    this.actionsSubject.next(
      this.actionsSubject.value.map(a =>
        a.id === id ? { ...a, status } : a
      )
    );
  }

  private log(message: string, level: LogEntry['level']) {
    this.logsSubject.next([
      ...this.logsSubject.value,
      { timestamp: new Date(), message, level },
    ]);
  }

}
