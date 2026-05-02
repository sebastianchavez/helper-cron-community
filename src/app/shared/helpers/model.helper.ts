import { LoggerService } from '../../core/services/logger/logger.service';

export class ModelHelper {
  static async preloadModel(modelName: string, chatApi: any, logger: LoggerService): Promise<void> {
    try {
      if (!modelName || !chatApi) return;
      await chatApi.send([{ role: 'user', content: 'Hi' }], modelName);
    } catch (error) {
      // Not critical if preloading fails
    }
  }

  static getSavedModel(models: any[], logger: LoggerService): string {
    const savedModel = localStorage.getItem('selectedModel');
    const savedModelExists = savedModel && models.find(m => m.name === savedModel);
    return savedModelExists ? savedModel : '';
  }

  static saveSelectedModel(modelName: string): void {
    localStorage.setItem('selectedModel', modelName);
  }

  static formatModelSize(sizeInBytes: number): string {
    if (!sizeInBytes) return '';
    return (sizeInBytes / 1e9).toFixed(1) + ' GB';
  }

  static isConversationalModel(model: { name: string; details?: { family?: string; families?: string[] } }): boolean {
    const name = (model.name || '').toLowerCase();
    const family = (model.details?.family || '').toLowerCase();
    const families = (model.details?.families || []).map((f: string) => f.toLowerCase());
    if (name.includes('embed')) return false;
    const embeddingFamilies = ['bert', 'nomic-bert', 'mxbai-embed', 'snowflake-arctic-embed'];
    if (embeddingFamilies.some(ef => family.includes(ef) || families.some((f: string) => f.includes(ef)))) return false;
    return true;
  }

  static filterConversationalModels<T extends { name: string; details?: { family?: string; families?: string[] } }>(models: T[]): T[] {
    return models.filter(m => ModelHelper.isConversationalModel(m));
  }
}
