import { Injectable } from '@angular/core';
import { LoggerService } from '../logger/logger.service';
import { TranslationService } from '../translation/translation.service';

@Injectable({
  providedIn: 'root'
})
export class TitleGenerationService {

  constructor(
    private logger: LoggerService,
    private translationService: TranslationService
  ) {}

  async generateConversationTitle(userMessage: string, selectedModel: string, conversationId: string): Promise<boolean> {
    try {
      const currentLanguage = this.translationService.getCurrentLanguage();
      const titlePrompt = this.getTitleGenerationPrompt(currentLanguage);

      const res = await window.agi?.chat.send(
        [{ role: 'system', content: titlePrompt }, { role: 'user', content: userMessage }],
        selectedModel
      );

      const title = res?.content?.trim();
      if (title) {
        await window.agi?.chatDb.updateConversationTitle(conversationId, title);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.warn('TITLE', 'generateConversationTitle', { info: 'No se pudo generar título', error });
      return false;
    }
  }

  private getTitleGenerationPrompt(languageCode: string): string {
    const prompts: { [key: string]: string } = {
      es: `Genera un título muy conciso (máximo 4-6 palabras) para la siguiente consulta del usuario. Responde SOLO con el título, sin comillas ni explicaciones.`,
      en: `Generate a very concise title (maximum 4-6 words) for the following user query. Respond ONLY with the title, no quotes or explanations.`,
      pt: `Gere um título muito conciso (máximo 4-6 palavras) para a seguinte consulta do usuário. Responda APENAS com o título, sem aspas ou explicações.`,
      fr: `Générez un titre très concis (maximum 4-6 mots) pour la requête utilisateur suivante. Répondez SEULEMENT avec le titre, sans guillemets ni explications.`,
      de: `Generieren Sie einen sehr prägnanten Titel (maximal 4-6 Wörter) für die folgende Benutzeranfrage. Antworten Sie NUR mit dem Titel, ohne Anführungszeichen oder Erklärungen.`,
    };
    return prompts[languageCode] || prompts['en'];
  }
}
