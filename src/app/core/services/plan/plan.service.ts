import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Plan } from '../../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
private planSubject = new BehaviorSubject<Plan | null>(null);
  plan$ = this.planSubject.asObservable();

  constructor() { 
    this.createMockPlan()
  }

  createMockPlan() {
    this.planSubject.next({
      id: crypto.randomUUID(),
      goal: 'Crear componente UserCard',
      status: 'pending',
      actions: [
        { id: '1', verb: 'create', title: 'Crear archivo de configuración', type: 'write_file', path: 'config.json', content: '{ "setting": true }' },
      ],
    });
  }

  approvePlan() {
    const plan = this.planSubject.value;
    if (!plan) return;

    this.planSubject.next({ ...plan, status: 'approved' });
  }

  rejectPlan() {
    const plan = this.planSubject.value;
    if (!plan) return;

    this.planSubject.next({ ...plan, status: 'rejected' });
  }
}
