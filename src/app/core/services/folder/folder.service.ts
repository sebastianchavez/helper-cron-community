import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
  conversation_count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private foldersSubject = new BehaviorSubject<FolderWithChildren[]>([]);
  folders$ = this.foldersSubject.asObservable();

  private selectedFolderSubject = new BehaviorSubject<Folder | null>(null);
  selectedFolder$ = this.selectedFolderSubject.asObservable();

  constructor() {
    this.loadFolders();
  }

  async loadFolders() {
    const tree = await window.agi?.folder.tree();
    this.foldersSubject.next(tree ?? []);
  }

  async createFolder(name: string, parentId?: string) {
    const folder = await window.agi?.folder.create(name, parentId);
    await this.loadFolders();
    return folder;
  }

  async updateFolder(id: string, name: string) {
    await window.agi?.folder.update(id, name);
    await this.loadFolders();
  }

  async deleteFolder(id: string) {
    await window.agi?.folder.delete(id);
    await this.loadFolders();
  }

  async moveFolder(folderId: string, newParentId?: string) {
    await window.agi?.folder.move(folderId, newParentId);
    await this.loadFolders();
  }

  selectFolder(folder: Folder | null) {
    this.selectedFolderSubject.next(folder);
  }

  getSelectedFolder(): Folder | null {
    return this.selectedFolderSubject.value;
  }

  async getFolderTree(): Promise<FolderWithChildren[]> {
    return (await window.agi?.folder.tree()) ?? [];
  }

  async getFoldersWithCount(): Promise<(Folder & { conversation_count: number })[]> {
    return (await window.agi?.folder.getWithCount()) ?? [];
  }
}
