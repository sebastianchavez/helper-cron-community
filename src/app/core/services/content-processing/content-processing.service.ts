import { Injectable } from '@angular/core';
import { ContextHelper, LanguageHelper } from '../../../shared/helpers';
import { TranslationService } from '../translation/translation.service';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ContentProcessingService {

  constructor(
    private translationService: TranslationService,
    private logger: LoggerService
  ) {}

  getCapabilityInstructions(associatedFolderPath?: string | null): string {
    return ContextHelper.getCapabilityInstructions(associatedFolderPath);
  }

  getLanguageInstructions(languageCode: string): string {
    return LanguageHelper.getLanguageInstructions(languageCode);
  }

  getTitleGenerationPrompt(languageCode: string): string {
    return LanguageHelper.getTitleGenerationPrompt(languageCode);
  }

  buildSystemPrompt(languageCode: string, associatedFolderPath?: string | null): string {
    let systemPrompt = this.getCapabilityInstructions(associatedFolderPath);
    systemPrompt += '\n\n' + this.getLanguageInstructions(languageCode);
    return systemPrompt;
  }

  processResponseContent(content: string): string {
    return content;
  }

  buildContext(messagesForAPI: any[], languageCode: string, associatedFolderPath?: string | null, limit: number = 12) {
    const languageInstructions = this.getLanguageInstructions(languageCode);
    const capabilityInstructions = this.getCapabilityInstructions(associatedFolderPath);
    return ContextHelper.buildApiContext(messagesForAPI, languageInstructions, capabilityInstructions, limit, this.logger);
  }
}
