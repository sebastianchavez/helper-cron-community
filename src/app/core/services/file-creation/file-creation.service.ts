import { Injectable } from '@angular/core';
import { FileHelper } from '../../../shared/helpers';
import { LoggerService } from '../logger/logger.service';

export interface FileCreationResult {
  content: string;
  filesCreated: number;
  needsConfirmation: boolean;
  pendingFiles?: { filename: string; suggestedType?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class FileCreationService {

  constructor(private logger: LoggerService) {}

  async processFileCreationCommands(content: string, userContext: string, associatedFolderPath: string | null, isExplicitCreation: boolean = false): Promise<FileCreationResult> {
    const result: FileCreationResult = { content, filesCreated: 0, needsConfirmation: false, pendingFiles: [] };

    if (!associatedFolderPath) return result;

    let processedContent = content;
    const executePromises: Promise<any>[] = [];
    let matchCount = 0;

    const fullCommandPattern = /\[CREAR_ARCHIVO:\s*([^\]]+)\]([\s\S]*?)\[\/CREAR_ARCHIVO\]/gi;
    const simpleFilePattern = /\[ARCHIVO:\s*([^\]]+)\]/gi;
    const codeBlockPattern = /```(\w+)?\s*([\s\S]*?)```/gi;
    const directJsonPattern = /\[\s*\{[\s\S]*?\}\s*\]/g;
    const incompleteFilePattern = /\[CREAR_ARCHIVO:\s*([^\]]+)\]/gi;

    let match;

    while ((match = fullCommandPattern.exec(content)) !== null) {
      matchCount++;
      const filename = match[1].trim();
      const fileContent = match[2].trim();
      const command = match[0];
      const hasNoExt = this.hasNoExtension(filename);
      const isRegularRequest = !isExplicitCreation;

      if (hasNoExt || isRegularRequest) {
        result.needsConfirmation = true;
        result.pendingFiles?.push({ filename, suggestedType: hasNoExt ? 'md' : undefined });
        const message = hasNoExt ? `⏳ Archivo \`${filename}\` (sin tipo especificado) - esperando confirmación` : `⏳ ¿Confirmas crear el archivo \`${filename}\`?`;
        processedContent = processedContent.replace(command, message);
        continue;
      }

      executePromises.push(
        this.executeFileCreationWithContent(filename, fileContent, associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'processFileCreationCommands', { info: 'Error in processFileCreationCommands', error }))
      );
      processedContent = processedContent.replace(command, `✅ **Archivo creado:** \`${filename}\`\n\n${fileContent}`);
    }

    while ((match = incompleteFilePattern.exec(content)) !== null) {
      const filename = match[1].trim();
      const command = match[0];
      if (!processedContent.includes(`Archivo \`${filename}\` creado exitosamente`) && !content.substring(match.index + command.length).match(/^\s*\[\/CREAR_ARCHIVO\]/i)) {
        matchCount++;
        executePromises.push(
          this.executeFileCreationWithContent(filename, '', associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'incompleteFile', { info: 'Error in incompleteFile', error }))
        );
        processedContent = processedContent.replace(command, `✅ Archivo \`${filename}\` creado exitosamente`);
      }
    }

    const remainingContent = processedContent;
    while ((match = simpleFilePattern.exec(remainingContent)) !== null) {
      if (!processedContent.includes(`Archivo \`${match[1].trim()}\` creado exitosamente`)) {
        matchCount++;
        const filename = match[1].trim();
        const command = match[0];
        executePromises.push(
          this.executeFileCreation(filename, associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'simpleFile', { info: 'Error in simpleFile', error }))
        );
        processedContent = processedContent.replace(command, `✅ Archivo \`${filename}\` creado exitosamente`);
      }
    }

    if (matchCount === 0) {
      const isFileCreationRequest = isExplicitCreation || (this.isFileCreationContext(content) && this.containsCreationRequest(userContext));
      if (isFileCreationRequest) {
        const detectedExtension = this.detectFileExtensionFromContext(userContext);
        const filename = this.generateFilenameFromContext(userContext, detectedExtension, content);
        let documentContent = content;
        if (filename.endsWith('.txt')) {
          documentContent = this.convertMarkdownToPlainText(documentContent);
        }
        executePromises.push(
          this.executeFileCreationWithContent(filename, documentContent, associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'docFile', { info: 'Error in docFile', error }))
        );
        matchCount++;
        processedContent = content + `\n\n---\n\n> **🎯 ACCIÓN COMPLETADA**  \n> ✅ **Archivo \`${filename}\` creado exitosamente**\n\n---`;
      } else {
        while ((match = codeBlockPattern.exec(content)) !== null) {
          matchCount++;
          const language = match[1] || 'txt';
          const codeContent = match[2].trim();
          const command = match[0];
          const filename = this.generateFilenameFromContext(userContext, language, content);
          executePromises.push(
            this.executeFileCreationWithContent(filename, codeContent, associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'codeBlock', { info: 'Error in codeBlock', error }))
          );
          processedContent = processedContent.replace(command, `✅ Archivo \`${filename}\` creado exitosamente con el contenido proporcionado`);
        }
      }
    }

    if (matchCount === 0 && this.isFileCreationContext(content)) {
      while ((match = directJsonPattern.exec(content)) !== null) {
        matchCount++;
        const jsonContent = match[0].trim();
        const filename = this.generateFilenameFromContext(userContext, 'json', content);
        executePromises.push(
          this.executeFileCreationWithContent(filename, jsonContent, associatedFolderPath).catch(error => this.logger.error('FILE-CREATION', 'directJson', { info: 'Error in directJson', error }))
        );
        processedContent = processedContent.replace(jsonContent, `✅ Archivo \`${filename}\` creado exitosamente con el contenido JSON`);
      }
    }

    if (executePromises.length > 0) {
      await Promise.all(executePromises);
      result.filesCreated = matchCount;
    }

    if (matchCount === 0 && this.isFileCreationRequest(userContext)) {
      const wrappedContent = this.wrapUndetectedFileContent(processedContent, userContext);
      if (wrappedContent.wasWrapped) {
        processedContent = wrappedContent.content;
        result.filesCreated += 1;
      }
    }

    result.content = processedContent;
    return result;
  }

  async executeFileCreationWithContent(filename: string, content: string, folderPath: string): Promise<string> {
    if (!folderPath) throw new Error('No hay carpeta asociada para crear archivos');
    const normalizedFolderPath = folderPath.replace(/\//g, '\\');
    let finalFilename = filename;
    let finalFilePath = `${normalizedFolderPath}\\${finalFilename}`;

    let counter = 1;
    while (true) {
      try {
        const readResult = await window.agi?.file.readText(finalFilePath);
        if (readResult?.success && readResult.content !== undefined) {
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
          const extension = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
          finalFilename = `${nameWithoutExt}_${counter}${extension}`;
          finalFilePath = `${normalizedFolderPath}\\${finalFilename}`;
          counter++;
          if (counter > 10) {
            finalFilename = `${nameWithoutExt}_${Date.now()}${extension}`;
            finalFilePath = `${normalizedFolderPath}\\${finalFilename}`;
            break;
          }
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    await window.agi?.file.writeText(finalFilePath, content);
    return finalFilename;
  }

  private async executeFileCreation(filename: string, folderPath: string): Promise<void> {
    if (!folderPath) throw new Error('No hay carpeta asociada para crear archivos');
    const filePath = `${folderPath}/${filename}`;
    const initialContent = FileHelper.getInitialFileContent(filename);
    await window.agi?.file.writeText(filePath, initialContent);
  }

  private convertMarkdownToPlainText(markdownContent: string): string {
    let plainText = markdownContent;
    plainText = plainText.replace(/^\*\*([^*]+)\*\*$/gm, '$1');
    plainText = plainText.replace(/^#+\s*/gm, '');
    plainText = plainText.replace(/\*\*([^*]+)\*\*/g, '$1');
    plainText = plainText.replace(/\*([^*]+)\*/g, '$1');
    plainText = plainText.replace(/^\* /gm, '• ');
    plainText = plainText.replace(/\n\n\n+/g, '\n\n');
    plainText = plainText.replace(/^---$/gm, '');
    return plainText.trim();
  }

  private hasContentShortcuts(content: string): boolean {
    return FileHelper.hasContentShortcuts(content);
  }

  private detectFileExtensionFromContext(userContext: string): string {
    const contextLower = userContext.toLowerCase();
    if (contextLower.includes('archivo de texto') || contextLower.includes('archivo txt')) return 'txt';
    if (contextLower.includes('archivo json')) return 'json';
    if (contextLower.includes('archivo js') || contextLower.includes('archivo javascript')) return 'js';
    if (contextLower.includes('archivo html')) return 'html';
    if (contextLower.includes('archivo css')) return 'css';
    if (contextLower.includes('archivo py') || contextLower.includes('archivo python')) return 'py';
    if (contextLower.includes('archivo vacío') || contextLower.includes('vacío') || contextLower.includes('vacio')) return 'txt';
    if (contextLower.includes('instrucciones') || contextLower.includes('tutorial') || contextLower.includes('guía') || contextLower.includes('manual') || contextLower.includes('resumen')) return 'txt';
    if (contextLower.includes('letra') || contextLower.includes('canción') || contextLower.includes('texto')) return 'txt';
    return 'md';
  }

  private isFileCreationContext(content: string): boolean {
    return FileHelper.isFileCreationContext(content, this.logger);
  }

  private containsCreationRequest(userContext: string): boolean {
    const contextLower = userContext.toLowerCase();
    const creationKeywords = ['crear', 'crea', 'generar', 'genera', 'hacer', 'haz', 'archivo', 'documento', 'file', 'escribir', 'escribe'];
    return creationKeywords.some(keyword => contextLower.includes(keyword));
  }

  private generateFilenameFromContext(userContext: string, language: string, modelContent?: string): string {
    return FileHelper.generateFilenameFromContext(userContext, language, modelContent, this.logger);
  }

  private hasNoExtension(filename: string): boolean {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex <= 0) return true;
    if (lastDotIndex === filename.length - 1) return true;
    return false;
  }

  private isFileCreationRequest(userContext: string): boolean {
    const contextLower = userContext.toLowerCase();
    const keywords = ['crear', 'crea', 'generar', 'genera', 'hacer', 'haz', 'archivo', 'documento', 'file', 'escribir', 'escribe'];
    return keywords.some(keyword => contextLower.includes(keyword));
  }

  private wrapUndetectedFileContent(content: string, userContext: string): { wasWrapped: boolean; content: string; filename: string } {
    const fileIndicatorPatterns = [
      /\*\*Archivo:?\s+["\']?([^\*"']+)["\']?\*\*/i,
      /^\s*#+\s+([^\n]+)/m
    ];
    let detectedTitle: string | undefined;
    for (const pattern of fileIndicatorPatterns) {
      const match = content.match(pattern);
      if (match) { detectedTitle = match[1]; break; }
    }
    if (detectedTitle) {
      const filename = this.generateFilenameFromTitle(detectedTitle, userContext);
      return { wasWrapped: true, content: `[CREAR_ARCHIVO: ${filename}]\n${content}\n[/CREAR_ARCHIVO]`, filename };
    }
    if (content.includes('\n') && content.length > 100) {
      const hasCodeIndicators = content.match(/\{|<|function|const|import|\/\//);
      const hasMarkdownIndicators = content.match(/^#+\s|^\*\*|^\-\s|^\d+\./m);
      if (hasCodeIndicators || hasMarkdownIndicators) {
        const filename = this.generateFilenameFromContext(userContext, 'md', content);
        return { wasWrapped: true, content: `[CREAR_ARCHIVO: ${filename}]\n${content}\n[/CREAR_ARCHIVO]`, filename };
      }
    }
    return { wasWrapped: false, content, filename: '' };
  }

  private generateFilenameFromTitle(title: string, userContext: string): string {
    let cleanTitle = title.replace(/[^a-záéíóúàèìòùäëïöüñ0-9\s-]/g, '').trim().substring(0, 50);
    cleanTitle = cleanTitle.replace(/\s+/g, '-').toLowerCase();
    const detectedExtension = this.detectFileExtensionFromContext(userContext);
    return `${cleanTitle || 'documento'}.${detectedExtension}`;
  }
}


