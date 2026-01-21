import { Injectable } from '@angular/core';
import { Project } from '../../models/project.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 'agicode',
      name: 'AgiCode',
      rootPath: 'D:/Desarrollo/Projects/agicode',
    },
    {
      id: 'pairprogramming',
      name: 'PairProgramming',
      rootPath: 'D:/Desarrollo/Projects/pairprogramming',
    },
  ];

  private activeProjectSubject = new BehaviorSubject<Project | null>(null);
  activeProject$ = this.activeProjectSubject.asObservable();

  getProjects(): Project[] {
    return this.projects;
  }

  addProject(project: Project): void {
    this.projects.push(project);
  }

  setActiveProject(project: Project) {
    this.activeProjectSubject.next(project);
  }

  getActiveProject(): Project | null {
    return this.activeProjectSubject.value;
  }

}
