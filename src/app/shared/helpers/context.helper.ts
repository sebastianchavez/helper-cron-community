import { LoggerService } from '../../core/services/logger/logger.service';

export class ContextHelper {
  static getCapabilityInstructions(associatedFolderPath?: string | null, logger?: LoggerService): string {
    let instructions = '';

    if (associatedFolderPath) {
      instructions += '⚠️ **INSTRUCCIÓN CRÍTICA - LEE ESTO PRIMERO:**\n\n';
      instructions += 'CADA VEZ que el usuario pida crear un archivo, documento, código, ejercicio, lectura, o contenido para guardar:\n';
      instructions += '1. ✅ DEBES responder usando EXACTAMENTE este formato\n';
      instructions += '2. ✅ NO debes mostrar previsualizaciones\n';
      instructions += '3. ✅ NO debes usar ```markdown``` o bloques de código normales\n';
      instructions += '4. ✅ SIEMPRE envuelve el contenido con [CREAR_ARCHIVO: ...] y [/CREAR_ARCHIVO]\n\n';
      instructions += '**FORMATO OBLIGATORIO:**\n';
      instructions += '[CREAR_ARCHIVO: nombre-del-archivo.extension]\n';
      instructions += 'AQUI VA TODO EL CONTENIDO DEL ARCHIVO\n';
      instructions += '[/CREAR_ARCHIVO]\n\n';
      instructions += '**RECUERDA:**\n';
      instructions += '- CADA petición de crear = UN archivo con [CREAR_ARCHIVO: ...] [/CREAR_ARCHIVO]\n';
      instructions += '- SOLO el comando y el contenido, nada más\n';
      instructions += '- La carpeta de trabajo es: ' + associatedFolderPath + '\n\n';
    } else {
      instructions += '### ℹ️ Sin carpeta de trabajo asociada\n';
      instructions += 'No hay carpeta asociada. Para crear archivos, el usuario debe asociar una carpeta primero.\n\n';
    }

    return instructions;
  }

  static buildApiContext(
    messagesForAPI: any[],
    languageInstructions: string,
    capabilityInstructions: string,
    limit: number = 12,
    logger?: LoggerService
  ): any[] {
    const userAssistantMessages = messagesForAPI
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => m.content.trim() !== '')
      .slice(-limit);

    const systemMessage = messagesForAPI.find(m => m.role === 'system');
    const result = [];

    if (systemMessage) {
      result.push({
        role: 'system',
        content: `${systemMessage.content}\n\n${languageInstructions}\n\n${capabilityInstructions}`
      });
    } else {
      result.push({
        role: 'system',
        content: `${languageInstructions}\n\n${capabilityInstructions}`
      });
    }

    result.push(...userAssistantMessages);
    return result;
  }
}
