export class FileHelper {
  static getShortFolderName(folderPath: string): string {
    if (!folderPath) return '';
    const segments = folderPath.replace(/\\/g, '/').split('/');
    return segments[segments.length - 1] || folderPath;
  }

  static isFileCreationContext(content: string, logger?: any): boolean {
    const fileCreationIndicators = [
      'archivo', 'file', 'crear', 'create', 'generar', 'generate',
      'json', 'html', 'css', 'js', 'ts', 'py', 'txt', 'md',
      'usuarios', 'productos', 'datos', 'mockeados', 'mock'
    ];
    const contentLower = content.toLowerCase();
    const hasIndicators = fileCreationIndicators.some(indicator => contentLower.includes(indicator));
    const hasCodeBlock = content.includes('```');
    const hasJsonStructure = /\[\s*\{[\s\S]*?\}\s*\]/.test(content);
    const isDocumentationStructure = /\*\*[^*]+\*\*|#{1,6}\s|\d+\.\s|\*\s|-\s/g.test(content);
    return hasIndicators && (hasCodeBlock || hasJsonStructure || isDocumentationStructure);
  }

  static generateFilenameFromContext(userContext: string, language: string, modelContent?: string, logger?: any): string {
    const contextLower = userContext.toLowerCase();

    if (modelContent) {
      const firstLine = modelContent.split('\n')[0].trim();
      const titleMatch = firstLine.match(/\*\*(?:.*?:\s*)?(.+?)\*\*/);
      if (titleMatch) {
        let title = titleMatch[1].trim();
        let filename = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        let extension = '.md';
        if (contextLower.includes('archivo de texto') || contextLower.includes('archivo txt')) extension = '.txt';
        else if (contextLower.includes('archivo json')) extension = '.json';
        else if (contextLower.includes('archivo html')) extension = '.html';
        else if (contextLower.includes('archivo css')) extension = '.css';
        else if (contextLower.includes('archivo js') || contextLower.includes('archivo javascript')) extension = '.js';
        return `${filename}${extension}`;
      }
    }

    const fileNameMatch = contextLower.match(/(?:crear|crea|generar|genera)\s+(?:un\s+)?(?:archivo\s+)?([\w\-\.]+\.[a-z]{2,4})/i);
    if (fileNameMatch) return fileNameMatch[1];

    let baseName = 'archivo';
    let extension = '.md';

    if (contextLower.includes('archivo de texto') || contextLower.includes('archivo txt')) extension = '.txt';
    else if (contextLower.includes('archivo json')) extension = '.json';
    else if (contextLower.includes('archivo html')) extension = '.html';
    else if (contextLower.includes('archivo css')) extension = '.css';
    else if (contextLower.includes('archivo js') || contextLower.includes('archivo javascript')) extension = '.js';

    if (contextLower.includes('readme')) { baseName = 'readme'; extension = '.md'; }
    else if (contextLower.includes('package.json')) return 'package.json';
    else if (contextLower.includes('dockerfile')) return 'Dockerfile';
    else if (contextLower.includes('.env') || contextLower.includes('environment')) return '.env';
    else if (contextLower.includes('usuario')) baseName = 'usuarios';
    else if (contextLower.includes('producto')) baseName = 'productos';
    else if (contextLower.includes('config') || contextLower.includes('configuración')) baseName = 'config';
    else if (contextLower.includes('servidor') || contextLower.includes('server')) baseName = 'servidor';
    else if (contextLower.includes('datos') || contextLower.includes('data')) baseName = 'datos';
    else if (contextLower.includes('estilo') || contextLower.includes('style')) baseName = 'estilos';
    else if (contextLower.includes('script')) baseName = 'script';

    const languageToExt: {[key: string]: string} = {
      'json': '.json', 'javascript': '.js', 'typescript': '.ts', 'python': '.py',
      'html': '.html', 'css': '.css', 'scss': '.scss', 'markdown': '.md', 'md': '.md',
      'yaml': '.yml', 'yml': '.yml', 'xml': '.xml', 'sql': '.sql', 'bash': '.sh',
      'shell': '.sh', 'powershell': '.ps1', 'txt': '.txt'
    };
    if (languageToExt[language.toLowerCase()]) extension = languageToExt[language.toLowerCase()];

    return `${baseName}${extension}`;
  }

  static hasContentShortcuts(content: string): boolean {
    const shortcutPatterns = [
      /\/\/\s*\.\.\..*más/i, /\/\*\s*\.\.\..*más/i, /\.\.\..*más/i,
      /\/\/\s*\.\.\..*elementos/i, /\/\/\s*\.\.\..*items/i,
    ];
    return shortcutPatterns.some(pattern => pattern.test(content));
  }

  static getInitialFileContent(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'json': return '{}';
      case 'js':
      case 'ts': return '// ' + filename + '\n';
      case 'html': return '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>';
      case 'css': return '/* ' + filename + ' */\n';
      case 'md': return '# ' + filename.replace('.md', '') + '\n\n';
      case 'txt':
      default: return '';
    }
  }
}
