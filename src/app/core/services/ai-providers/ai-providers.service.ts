import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ProviderModel {
  id: string;
  displayName: string;
  provider: 'ollama-local';
  badge?: string;
  size?: string;
}

export interface ProviderGroup {
  id: 'ollama-local';
  label: string;
  icon: string;
  configured: boolean;
  available: boolean;
  models: ProviderModel[];
}

@Injectable({
  providedIn: 'root'
})
export class AIProvidersService {
  private groupsSubject = new BehaviorSubject<ProviderGroup[]>([]);
  public groups$ = this.groupsSubject.asObservable();

  /** Detect which provider a model name belongs to */
  getProvider(modelId: string): 'ollama-local' {
    return 'ollama-local';
  }

  /** Strip provider prefix to get the actual API model name */
  getApiModelName(modelId: string): string {
    return modelId;
  }

  /** Load all provider groups and their models */
  async loadAll(): Promise<ProviderGroup[]> {
    const groups: ProviderGroup[] = [];

    // Local Ollama
    const localGroup = await this.loadOllamaLocal();
    groups.push(localGroup);

    this.groupsSubject.next(groups);
    return groups;
  }

  private async loadOllamaLocal(): Promise<ProviderGroup> {
    const group: ProviderGroup = {
      id: 'ollama-local',
      label: 'Ollama Local',
      icon: 'computer',
      configured: true,
      available: false,
      models: [],
    };

    try {
      const status = await window.agi?.ollama.checkStatus();
      if (status?.running) {
        group.available = true;
        const allModels = await window.agi?.chat.listModels() ?? [];
        group.models = allModels
          .filter(m => {
            const name = (m.name || '').toLowerCase();
            const family = ((m.details as any)?.family || '').toLowerCase();
            if (name.includes('embed')) return false;
            const embeddingFamilies = ['bert', 'nomic-bert', 'mxbai-embed', 'snowflake-arctic-embed'];
            if (embeddingFamilies.some(ef => family.includes(ef))) return false;
            return true;
          })
          .map(m => ({
            id: m.name,
            displayName: m.name,
            provider: 'ollama-local' as const,
            size: this.formatBytes(m.size),
          }));
      }
    } catch {
      // Silent failure - Ollama may not be running
    }

    return group;
  }

  private formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '';
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  }

  getCurrentGroups(): ProviderGroup[] {
    return this.groupsSubject.value;
  }

  getAllModels(): ProviderModel[] {
    return this.groupsSubject.value.flatMap(g => g.models);
  }
}
