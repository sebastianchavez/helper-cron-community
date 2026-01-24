import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, NgZone, OnInit, OnDestroy, ViewChild,  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSimpliAlertService } from 'ngx-simpli-alert';
import { ChatService } from '../../core/services/chat/chat.service';
import { FolderSidebarComponent } from '../../core/components/folder-sidebar/folder-sidebar.component';
import { FolderService } from '../../core/services/folder/folder.service';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UserService } from '../../core/services/user/user.service';
import { AIModelsService, OllamaStatus } from '../../core/services/ai-models/ai-models.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  imports: [
    CommonModule,
    FormsModule,
    FolderSidebarComponent,
    TranslatePipe
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef<HTMLTextAreaElement>;
  input = '';
  messages: any[] = [];

  models: any[] = [];
  selectedModel = '';
  showModelDropdown = false;

  loading = false;
  folderLoading = false;
  typingText = 'Pensando...';
  streamingMessageId: string | null = null;
  isStreaming = false;
  streamingDots = '';
  userName = 'Usuario';
  userInitials = 'U';

  private typingTexts = ['Pensando...', 'Analizando...', 'Escribiendo...', 'Procesando...'];
  private typingInterval: any;
  private dotsInterval: any;
  private streamCleanup: (() => void) | null = null;
  private userSubscription?: Subscription;
  private selectFolderTimeout: any;

  currentConversationId: string | null = null;

  private shouldScrollToBottom = false;

  conversations: any[] = [];
  selectedConversationId: string | null = null;
  selectedFolderId: string | null = null;
  isDragging = false;
  draggedConversationId: string | null = null;
  showUserMenu = false;
  isDarkMode = false;
  showNoModelsModal = false;
  
  // Ollama modal properties
  showOllamaModal = false;
  ollamaStatus: OllamaStatus = { installed: false, running: false };
  isStartingOllama = false;
  ollamaStartError: string | null = null;


  constructor(
    private chat: ChatService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private folderService: FolderService,
    private router: Router,
    private translationService: TranslationService,
    private userService: UserService,
    private aiModelsService: AIModelsService,
    private logger: LoggerService,
    private alertService: NgxSimpliAlertService
  ) {
    this.chat.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.shouldScrollToBottom = true;
    });
  }

  async ngOnInit(): Promise<void> {
    // Verificar estado de Ollama primero
    await this.checkOllamaOnStartup();
    
    // Cargar modelos primero para establecer el modelo por defecto
    await this.loadModels();
    
    // Inicializar tema
    this.initializeTheme();
    
    // Suscribirse a los cambios del usuario
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.userName = user?.name || this.translationService.translate('user');
      this.userInitials = this.getInitials(user?.name || this.translationService.translate('user'));
    });
    
    // 1️⃣ crear conversación nueva (por ahora simple)
    await this.loadConversations();

    if (this.conversations.length > 0) {
      await this.openConversation(this.conversations[0].id);
    } else {
      // const conv = await window.agi?.chatDb.createConversation('Nuevo chat');
      // this.conversations = [conv];
      // this.selectedConversationId = conv.id;
      // this.currentConversationId = conv.id;
      await this.newConversation();
    }


  }

  async loadConversations() {
    this.logger.log('CHATBOT', 'loadConversations', { info: 'loadConversations called' });
    this.conversations = await window.agi?.chatDb.listConversations() || [];
    this.logger.log('CHATBOT', 'loadConversations', { info: `Loaded ${this.conversations.length} root conversations`, response: this.conversations });
  }

  async openConversation(conversationId: string) {
    // Forzar reseteo del estado si está cargando para asegurar que el chat se habilite
    if (this.loading) {
      this.stopResponse(); // Detener cualquier operación en curso
    }

    // **Asegurar estados limpios al abrir conversación**
    this.ensureCleanState('abriendo conversación');

    this.selectedConversationId = conversationId;
    this.currentConversationId = conversationId;

    // 1️⃣ limpiar estado UI
    this.chat.clear();

    // 2️⃣ cargar mensajes desde SQLite
    const messages = await window.agi?.chatDb.getMessages(conversationId) || [];

    // 3️⃣ reconstruir ChatService
    for (const msg of messages) {
      if (msg.role === 'user') {
        this.chat.addUserMessage(msg.content);
      } else if (msg.role === 'assistant') {
        this.chat.addAssistantMessage(msg.content);
      }
    }

    // 4️⃣ **asegurar nuevamente que el chat esté habilitado**
    this.ensureCleanState('después de cargar mensajes');
    this.shouldScrollToBottom = true;
  }

  async newConversation() {
    // Asegurar estados limpios al iniciar una nueva conversación
    this.ensureCleanState('iniciando nueva conversación');
    
    const conv = await window.agi?.chatDb.createConversation('Nuevo chat', this.selectedFolderId || undefined);
    this.conversations.unshift(conv);
    await this.openConversation(conv.id);
    
    // Recargar carpetas para actualizar conteos
    this.folderLoading = true;
    await this.folderService.loadFoldersWithCount();
    this.folderLoading = false;
    
    // Asegurar estados limpios después de cargar
    this.ensureCleanState('después de crear nueva conversación');
  }

  async loadModels() {
    if (window.agi?.chat.listModels) {
      try {
        const allModels = await window.agi.chat.listModels();

        // Mostrar todos los modelos instalados
        this.models = allModels;

        // Cargar modelo guardado en localStorage
        const savedModel = this.loadSelectedModelFromStorage();
        
        if (savedModel && this.models.some(m => m.name === savedModel)) {
          // Si hay un modelo guardado y está disponible, usarlo
          this.selectedModel = savedModel;
        } else {
          // Si no hay modelo guardado o no está disponible, no seleccionar ninguno
          this.selectedModel = '';
        }
      } catch (error) {
        this.logger.error('CHATBOT', 'loadModels', { info: 'Error loading models', error });
        // En caso de error, no seleccionar modelo
        this.selectedModel = '';
      }
    }
  }

  selectModel(modelName: string) {
    this.selectedModel = modelName;
    this.saveSelectedModelToStorage(modelName);
    this.showModelDropdown = false;
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  private saveSelectedModelToStorage(modelName: string) {
    try {
      localStorage.setItem('selectedAIModel', modelName);
    } catch (error) {
      this.logger.error('CHATBOT', 'saveSelectedModelToStorage', { info: 'Error saving model to localStorage', error });
    }
  }

  private loadSelectedModelFromStorage(): string | null {
    try {
      return localStorage.getItem('selectedAIModel');
    } catch (error) {
      this.logger.error('CHATBOT', 'loadSelectedModelFromStorage', { info: 'Error loading model from localStorage', error });
      return null;
    }
  }

  ngAfterViewChecked() {

    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      this.logger.error('CHATBOT', 'scrollToBottom', { info: 'Error al hacer scroll', error: err });
    }
  }

  onEnterKey(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private buildContext(limit = 12) {
    const userMessages = this.chat
      .getMessages()
      .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content.trim() !== '')
      .slice(-limit);

    // Obtener el idioma actual del usuario
    const currentLanguage = this.translationService.getCurrentLanguage();
    const languageInstruction = this.getLanguageInstruction(currentLanguage);

    // Agregar instrucción de idioma al inicio del contexto
    const systemMessage = {
      role: 'system',
      content: languageInstruction
    };

    return [systemMessage, ...userMessages];
  }

  private getLanguageInstruction(languageCode: string): string {
    const languageMap: { [key: string]: string } = {
      'es': 'Responde siempre en español. Mantén un tono profesional y claro.',
      'en': 'Always respond in English. Maintain a professional and clear tone.',
      'fr': 'Réponds toujours en français. Maintiens un ton professionnel et clair.',
      'de': 'Antworte immer auf Deutsch. Verwende einen professionellen und klaren Ton.',
      'it': 'Rispondi sempre in italiano. Mantieni un tono professionale e chiaro.',
      'pt': 'Responde sempre em português. Mantém um tom profissional e claro.',
      'zh': '始终用中文回答。保持专业和清晰的语调。',
      'ja': '日本語で回答してください。プロフェッショナルで明確な口調を保ってください。',
      'ko': '항상 한국어로 답변해 주세요. 전문적이고 명확한 어조를 유지해 주세요.',
      'ru': 'Всегда отвечайте на русском языке. Поддерживайте профессиональный и ясный тон.',
      'ar': 'اجب دائماً باللغة العربية. حافظ على نبرة مهنية وواضحة.',
      'hi': 'हमेशा हिंदी में उत्तर दें। पेशेवर और स्पष्ट स्वर बनाए रखें।'
    };

    return languageMap[languageCode] || languageMap['es']; // Default to Spanish if language not found
  }

  private getTitleInstruction(languageCode: string): string {
    const titleInstructionMap: { [key: string]: string } = {
      'es': 'Genera un título corto (máximo 6 palabras) que resuma el mensaje del usuario. No uses comillas, emojis ni puntuación final. Responde solo en español.',
      'en': 'Generate a short title (maximum 6 words) that summarizes the user message. Do not use quotes, emojis or final punctuation. Respond only in English.',
      'fr': 'Génère un titre court (maximum 6 mots) qui résume le message de l\'utilisateur. N\'utilise pas de guillemets, d\'emojis ou de ponctuation finale. Réponds seulement en français.',
      'de': 'Erzeuge einen kurzen Titel (maximal 6 Wörter), der die Benutzernachricht zusammenfasst. Verwende keine Anführungszeichen, Emojis oder Endzeichen. Antworte nur auf Deutsch.',
      'it': 'Genera un titolo breve (massimo 6 parole) che riassuma il messaggio dell\'utente. Non usare virgolette, emoji o punteggiatura finale. Rispondi solo in italiano.',
      'pt': 'Gera um título curto (máximo 6 palavras) que resuma a mensagem do usuário. Não uses aspas, emojis ou pontuação final. Responde apenas em português.',
      'zh': '生成一个简短的标题（最多6个词）来总结用户信息。不要使用引号、表情符号或结尾标点。仅用中文回答。',
      'ja': 'ユーザーメッセージを要約する短いタイトル（最大6語）を生成してください。引用符、絵文字、最終句読点は使用しないでください。日本語でのみ回答してください。',
      'ko': '사용자 메시지를 요약하는 짧은 제목(최대 6단어)을 생성하세요. 따옴표, 이모지 또는 마침 구두점을 사용하지 마세요. 한국어로만 답변하세요.',
      'ru': 'Сгенерируйте короткий заголовок (максимум 6 слов), который резюмирует сообщение пользователя. Не используйте кавычки, эмодзи или конечные знаки препинания. Отвечайте только на русском языке.',
      'ar': 'أنشئ عنواناً قصيراً (أقصى 6 كلمات) يلخص رسالة المستخدم. لا تستخدم علامات اقتباس أو رموز تعبيرية أو علامات ترقيم نهائية. أجب بالعربية فقط.',
      'hi': 'उपयोगकर्ता संदेश का सारांश देने वाला एक छोटा शीर्षक (अधिकतम 6 शब्द) बनाएं। उद्धरण चिह्न, इमोजी या अंतिम विराम चिह्न का उपयोग न करें। केवल हिंदी में उत्तर दें।'
    };

    return titleInstructionMap[languageCode] || titleInstructionMap['es'];
  }


  async send() {
    if (!this.input.trim()) return;

    // Verificar si hay modelo seleccionado
    if (!this.selectedModel) {
      // Mostrar mensaje o abrir dropdown para seleccionar modelo
      this.toggleModelDropdown();
      return;
    }

    // Verificar si hay modelos disponibles
    if (this.models.length === 0) {
      this.showNoModelsModal = true;
      return;
    }

    const userMessage = this.input;

    this.chat.addUserMessage(userMessage);
    this.input = '';

    // ⏳ Activar indicador de carga INMEDIATAMENTE
    this.loading = true;
    this.isStreaming = false;
    this.startTypingAnimation();

    // 💾 Guardar en SQLite
    if (this.currentConversationId) {
      await window.agi?.chatDb.addMessage({
        conversationId: this.currentConversationId,
        role: 'user',
        content: userMessage,
      });

      // 🏷️ Autogenerar título solo si es el primer mensaje
      const totalMessages = this.chat.getMessages().length;

      if (totalMessages === 1 && this.currentConversationId) {
        try {
          const currentLanguage = this.translationService.getCurrentLanguage();
          const titleInstruction = this.getTitleInstruction(currentLanguage);
          
          const res = await window.agi?.chat.send(
            [
              {
                role: 'system',
                content: titleInstruction
              },
              { role: 'user', content: userMessage },
            ],
            this.selectedModel
          );

          const title = res?.content?.trim();

          if (title) {
            await window.agi?.chatDb.updateConversationTitle(
              this.currentConversationId,
              title
            );

            // refrescar sidebar respetando la carpeta seleccionada
            if (this.selectedFolderId) {
              // Recargar la vista de carpeta completa para mantener la estructura correcta
              await this.selectFolder(this.selectedFolderId);
            } else {
              await this.loadConversations();
            }
          }
        } catch (err) {
          this.logger.warn('CHATBOT', 'sendMessage', { info: 'No se pudo generar título', error: err });
        }
      }

    }

    // Construir contexto DESPUÉS de agregar el mensaje del usuario
    // pero ANTES de agregar el mensaje vacío del asistente
    const contextMessages = this.buildContext();

    // NO crear mensaje vacío aún, solo preparar el ID
    const messageId = Date.now().toString();
    this.streamingMessageId = messageId;

    // Usar streaming
    if (window.agi?.chat.stream) {
      this.streamCleanup = window.agi.chat.stream(
        contextMessages, // Ahora incluye el mensaje del usuario
        this.selectedModel,
        (chunk: string) => {
          // Ejecutar dentro de la zona de Angular para que detecte los cambios
          this.ngZone.run(() => {
            // Al recibir el primer chunk, crear el mensaje del asistente y cambiar estado
            if (!this.isStreaming) {
              this.isStreaming = true;
              this.stopTypingAnimation();
              this.startDotsAnimation();
              // Crear el mensaje del asistente AHORA con el primer chunk
              this.chat.addAssistantMessage(chunk);
            } else {
              // Actualizar el último mensaje con el nuevo chunk
              this.updateStreamingMessage(chunk);
            }
            this.shouldScrollToBottom = true;
          });
        },
        () => {
          // Ejecutar dentro de la zona de Angular
          this.ngZone.run(async () => {
            // Streaming completado
            this.loading = false;
            this.isStreaming = false;
            this.stopTypingAnimation();
            this.stopDotsAnimation();
            this.streamingMessageId = null;
            this.streamCleanup = null;

            // 💾 Guardar mensaje assistant completo
            if (this.currentConversationId) {
              const messages = this.chat.getMessages();
              const last = messages[messages.length - 1];

              if (last?.role === 'assistant') {
                await window.agi?.chatDb.addMessage({
                  conversationId: this.currentConversationId,
                  role: 'assistant',
                  content: last.content,
                });

                // Actualizar vista de conversaciones respetando la carpeta seleccionada
                if (this.selectedFolderId) {
                  // Recargar la vista de carpeta completa para mantener la estructura correcta
                  await this.selectFolder(this.selectedFolderId);
                } else {
                  await this.loadConversations();
                }
              }
            }
          });
        },
        (error: string) => {
          // Ejecutar dentro de la zona de Angular
          this.ngZone.run(() => {
            // Error en streaming
            this.logger.error('CHATBOT', 'sendMessage', { info: 'Error en streaming', error });
            this.loading = false;
            this.isStreaming = false;
            this.stopTypingAnimation();
            this.stopDotsAnimation();
            this.streamingMessageId = null;
            this.streamCleanup = null;
            this.chat.addAssistantMessage(`Error: ${error}`);
          });
        }
      );
    } else {
      // Fallback si window.agi no está disponible
      this.loading = false;
      this.stopTypingAnimation();
      this.chat.addAssistantMessage('Error: API de chat no disponible');
    }
  }

  stopResponse() {
    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = null;
    }
    
    this.loading = false;
    this.isStreaming = false;
    this.stopTypingAnimation();
    this.stopDotsAnimation();
    this.streamingMessageId = null;
    
    // Si hay un mensaje parcial, mantenerlo
    const messages = this.chat.getMessages();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content.trim()) {
        // Crear una nueva lista de mensajes con el último mensaje modificado
        const updatedMessages = [...messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + '\n\n*[Respuesta detenida por el usuario]*'
        };
        
        // Limpiar y agregar todos los mensajes nuevamente
        this.chat.clear();
        updatedMessages.forEach(msg => {
          if (msg.role === 'user') {
            this.chat.addUserMessage(msg.content);
          } else if (msg.role === 'assistant') {
            this.chat.addAssistantMessage(msg.content);
          }
        });
      }
    }
  }

  private updateStreamingMessage(chunk: string) {
    const messages = this.chat.getMessages();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content += chunk;
        // Forzar actualización
        this.messages = [...messages];
      }
    }
  }

  private startTypingAnimation() {
    let index = 0;
    this.typingText = this.typingTexts[0];
    this.typingInterval = setInterval(() => {
      index = (index + 1) % this.typingTexts.length;
      this.typingText = this.typingTexts[index];
    }, 2000);
  }

  private stopTypingAnimation() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  private startDotsAnimation() {
    let dotCount = 0;
    this.streamingDots = '.';
    this.dotsInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      this.streamingDots = '.'.repeat(dotCount || 1);
    }, 500);
  }

  private stopDotsAnimation() {
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
      this.dotsInterval = null;
      this.streamingDots = '';
    }
  }

  ngOnDestroy() {
    this.stopTypingAnimation();
    this.stopDotsAnimation();
    if (this.streamCleanup) {
      this.streamCleanup();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.selectFolderTimeout) {
      clearTimeout(this.selectFolderTimeout);
    }
  }

  formatMessageContent(content: string): SafeHtml {
    // Expresión regular para encontrar bloques de código con ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let formattedContent = content;
    const codeBlocks: string[] = [];
    let blockIndex = 0;

    // Reemplazar bloques de código con marcadores temporales
    formattedContent = formattedContent.replace(codeBlockRegex, (match, language, code) => {
      const lang = language || 'code';
      const escapedCode = this.escapeHtml(code.trim());
      const codeId = `code-block-${Date.now()}-${blockIndex}`;
      const base64Code = btoa(encodeURIComponent(code.trim()));

      const htmlBlock = `
        <div class="my-4 rounded-md overflow-hidden bg-[#0d1117] border border-slate-700">
          <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700 text-xs text-slate-400">
            <span>${lang}</span>
            <button type="button" class="flex items-center gap-1 hover:text-white transition-colors" data-code-id="${codeId}" data-code-base64="${base64Code}">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              Copiar código
            </button>
          </div>
          <div class="p-4 overflow-x-auto text-sm font-mono text-slate-300">
            <pre><code>${escapedCode}</code></pre>
          </div>
        </div>
      `;

      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      codeBlocks[blockIndex] = htmlBlock;
      blockIndex++;
      return placeholder;
    });

    // Convertir títulos ### (subtítulos - h3)
    formattedContent = formattedContent.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    
    // Convertir títulos ## (títulos principales - h2)
    formattedContent = formattedContent.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');

    // Convertir texto en negrita (**texto**) a <strong>
    formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convertir texto en negrita (*texto*) a <strong>
    formattedContent = formattedContent.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<strong>$1</strong>');

    // Convertir líneas que empiecen con asterisco en listas
    const lines = formattedContent.split('\n');
    let inList = false;
    let processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Verificar si la línea comienza con asterisco y no termina con asterisco
      const isListItem = trimmedLine.match(/^\*\s+(.*)/) && !trimmedLine.endsWith('*');
      
      if (isListItem) {
        const listItemText = trimmedLine.substring(2); // Remover "* "
        
        if (!inList) {
          // Iniciar nueva lista
          processedLines.push('<ul class="list-disc list-inside my-2 space-y-1">');
          inList = true;
        }
        
        processedLines.push(`<li class="ml-4">${listItemText}</li>`);
      } else {
        if (inList) {
          // Cerrar lista si estábamos en una
          processedLines.push('</ul>');
          inList = false;
        }
        
        // Solo agregar líneas que no estén vacías o agregar un salto si no estamos en una lista
        if (trimmedLine || !inList) {
          processedLines.push(line);
        }
      }
    }
    
    // Cerrar lista si terminamos dentro de una
    if (inList) {
      processedLines.push('</ul>');
    }
    
    formattedContent = processedLines.join('\n');

    // Convertir saltos de línea en <br> pero evitar dentro de listas HTML
    // Primero marcamos las listas para protegerlas
    const listMatches: string[] = [];
    let listIndex = 0;
    
    // Reemplazar listas con marcadores temporales
    formattedContent = formattedContent.replace(/<ul[^>]*>[\s\S]*?<\/ul>/g, (match) => {
      const placeholder = `__LIST_PLACEHOLDER_${listIndex}__`;
      listMatches[listIndex] = match;
      listIndex++;
      return placeholder;
    });
    
    // Ahora convertir saltos de línea en <br> solo fuera de las listas
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Restaurar las listas
    listMatches.forEach((listHtml, index) => {
      formattedContent = formattedContent.replace(`__LIST_PLACEHOLDER_${index}__`, listHtml);
    });

    // Restaurar los bloques de código
    codeBlocks.forEach((block, index) => {
      formattedContent = formattedContent.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  copyCodeToClipboard(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.logger.log('CHATBOT', 'copyCodeToClipboard', { info: 'Código copiado al portapapeles' });
    }).catch(err => {
      this.logger.error('CHATBOT', 'copyCodeToClipboard', { info: 'Error al copiar código', error: err });
    });
  }

  handleCodeCopyClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest('button[data-code-base64]');

    if (button) {
      const base64Code = button.getAttribute('data-code-base64');
      if (base64Code) {
        try {
          const code = decodeURIComponent(atob(base64Code));
          this.copyCodeToClipboard(code);
        } catch (error) {
          this.logger.error('CHATBOT', 'handleCodeCopyClick', { info: 'Error al decodificar código', error });
        }
      }
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Garantiza que todos los estados estén limpios para la interacción del usuario
   */
  private ensureCleanState(reason: string = 'general'): void {
    this.loading = false;
    this.isStreaming = false;
    
    // Si hay un input, asegurar que esté habilitado
    if (this.chatInput?.nativeElement) {
      this.chatInput.nativeElement.disabled = false;
      this.chatInput.nativeElement.readOnly = false;
    }
    
    this.logger.log('CHATBOT', 'ensureCleanState', { 
      info: `Estados limpiados: ${reason}`,
      response: {
        loading: this.loading,
        isStreaming: this.isStreaming,
        inputDisabled: this.chatInput?.nativeElement?.disabled,
        inputReadOnly: this.chatInput?.nativeElement?.readOnly
      }
    });
  }

  async deleteConversation(event: MouseEvent, conversationId: string) {
    event.stopPropagation(); // Evitar que se abra la conversación
    
    this.alertService.show({
      title: this.translationService.translate('chat.deleteConversationTitle'),
      description: this.translationService.translate('chat.deleteConversationDescription'),
      type: 'question',
      confirmButtonText: this.translationService.translate('common.delete'),
      cancelButtonText: this.translationService.translate('common.cancel')
    }, 
    async () => {
      await window.agi?.chatDb.deleteConversation(conversationId);

      // **LIMPIAR ESTADOS INMEDIATAMENTE**
      this.ensureCleanState('después de eliminar conversación');

      // Remover de la lista actual
      this.conversations = this.conversations.filter(c => c.id !== conversationId);

      // Si eliminamos la conversación activa, abrir otra o crear nueva
      if (this.currentConversationId === conversationId) {
        if (this.conversations.length > 0) {
          await this.openConversation(this.conversations[0].id);
        } else {
          await this.newConversation();
        }
      }
      
      // **ASEGURAR ESTADO LIMPIO NUEVAMENTE**
      this.ensureCleanState('después de eliminar conversación y abrir/crear nueva');
      
      // Recargar carpetas para actualizar conteos
      this.folderLoading = true;
      await this.folderService.loadFoldersWithCount();
      this.folderLoading = false;
      
      // **NO HAY ACCIONES DE FOCUS: El usuario puede hacer clic donde necesite**
      this.logger.log('CHATBOT', 'deleteConversation', { 
        info: 'Conversación eliminada exitosamente - sin restauración automática de focus'
      });
    });
  }

  async selectFolder(folderId: string | null) {
    // Evitar múltiples llamadas con debounce
    if (this.selectFolderTimeout) {
      clearTimeout(this.selectFolderTimeout);
    }
    
    this.selectFolderTimeout = setTimeout(async () => {
      await this.performSelectFolder(folderId);
    }, 200);
  }

  private async performSelectFolder(folderId: string | null) {
    this.logger.log('CHATBOT', 'selectFolder', { info: `selectFolder called with folderId: ${folderId}` });
    this.selectedFolderId = folderId;
    
    if (folderId) {
      // Cargar conversaciones de la carpeta y las del root por separado
      const conversationsByFolder = await window.agi?.chatDb.getConversationsByFolder?.(folderId) || [];
      const rootConversations = await window.agi?.chatDb.listConversations?.() || [];
      
      this.logger.log('CHATBOT', 'selectFolder', { info: `Found ${conversationsByFolder.length} conversations in folder ${folderId}`, response: conversationsByFolder });
      
      // Crear una lista combinada con marcadores apropiados
      this.conversations = [
        ...conversationsByFolder.map((conv: any) => ({...conv, isFromSelectedFolder: true})),
        ...rootConversations.filter((conv: any) => !conversationsByFolder.find(fc => fc.id === conv.id)).map((conv: any) => ({...conv, isFromSelectedFolder: false}))
      ];
    } else {
      this.logger.log('CHATBOT', 'selectFolder', { info: 'Loading root conversations' });
      await this.loadConversations();
    }
  }

  onFolderCreated() {
    this.selectedFolderId = null;
    this.loadConversations();
  }

  getFolderConversations(): any[] {
    if (!this.selectedFolderId) return [];
    return this.conversations.filter(conv => conv.isFromSelectedFolder);
  }

  getRootConversations(): any[] {
    if (!this.selectedFolderId) return this.conversations;
    return this.conversations.filter(conv => !conv.isFromSelectedFolder);
  }

  async deleteConversationById(conversationId: string) {
    // Crear un evento dummy para usar el método existente
    const dummyEvent = new MouseEvent('click');
    await this.deleteConversation(dummyEvent, conversationId);
  }

  // Métodos del menú de usuario
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openProfile() {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  initializeTheme() {
    // Comprobar si hay tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Detectar preferencia del sistema
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.showUserMenu = false;
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  openAbout() {
    this.router.navigate(['/about']);
    this.showUserMenu = false;
  }

  closeApp() {
    // Por ahora solo cerrar el menú, la funcionalidad de cerrar app se puede implementar después
    this.logger.log('CHATBOT', 'closeApp', { info: 'Cerrar aplicación solicitado' });
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Element;
    
    // Cerrar dropdown del modelo si se hace clic fuera
    if (this.showModelDropdown && !target.closest('.relative')) {
      this.showModelDropdown = false;
    }
    
    // Cerrar el menú de usuario si se hace clic fuera de él
    if (this.showUserMenu && !target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }

  onDragStart(event: DragEvent, conversationId: string) {
    if (this.loading) {
      event.preventDefault();
      return;
    }
    
    this.isDragging = true;
    this.draggedConversationId = conversationId;
    event.dataTransfer?.setData('text/plain', conversationId);
  }

  onDragEnd(event: DragEvent) {
    this.isDragging = false;
    this.draggedConversationId = null;
  }

  async moveConversationToFolder(data: {conversationId: string, folderId: string}) {
    this.logger.log('CHATBOT', 'moveConversationToFolder', { info: 'moveConversationToFolder called', response: data });
    
    try {
      // Verificar que el método existe
      if (!window.agi?.chatDb.moveConversationToFolder) {
        this.logger.error('CHATBOT', 'moveConversationToFolder', { info: 'moveConversationToFolder method not found' });
        return;
      }
      
      await window.agi.chatDb.moveConversationToFolder(data.conversationId, data.folderId);
      this.logger.log('CHATBOT', 'moveConversationToFolder', { info: 'Move successful, updating UI' });
      
      // Remover la conversación de la lista actual
      this.conversations = this.conversations.filter(c => c.id !== data.conversationId);
      
      // Si eliminamos la conversación activa, cambiar a otra o crear nueva
      if (this.currentConversationId === data.conversationId) {
        if (this.conversations.length > 0) {
          await this.openConversation(this.conversations[0].id);
        } else {
          await this.newConversation();
        }
      }
      
      // Recargar carpetas para actualizar conteos
      this.folderLoading = true;
      await this.folderService.loadFoldersWithCount();
      this.folderLoading = false;
      
      this.logger.log('CHATBOT', 'moveConversationToFolder', { info: `Conversación movida a carpeta ${data.folderId} - UI actualizada` });
    } catch (error) {
      this.logger.error('CHATBOT', 'moveConversationToFolder', { info: 'Error moviendo conversación', error });
    }
  }

  async createChatInFolder(folderId: string) {
    const conv = await window.agi?.chatDb.createConversation('Nuevo chat', folderId);
    
    // Si estamos viendo esa carpeta, agregar a la lista
    if (this.selectedFolderId === folderId) {
      this.conversations.unshift(conv);
    }
    
    // Cambiar a esa carpeta y abrir el chat
    await this.selectFolder(folderId);
    await this.openConversation(conv.id);
    
    // Recargar carpetas para actualizar conteos
    this.folderLoading = true;
    await this.folderService.loadFoldersWithCount();
    this.folderLoading = false;
  }

  private getInitials(name: string): string {
    if (!name || name.trim() === '') return 'U';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    // Para múltiples palabras, tomar la primera letra de las dos primeras palabras
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  }

  getWelcomeMessage(): string {
    const template = this.translationService.translate('personalizedWelcome');
    const firstName = this.userName.split(' ')[0]; // Solo usar el primer nombre
    return template.replace('{name}', firstName);
  }

  // Ollama management methods
  private async checkOllamaOnStartup(): Promise<void> {
    try {
      this.ollamaStatus = await this.aiModelsService.checkOllamaStatus();
      
      // Si Ollama no está instalado o no está corriendo, mostrar el modal
      if (!this.ollamaStatus.installed || !this.ollamaStatus.running) {
        this.showOllamaModal = true;
      }
    } catch (error) {
      this.logger.error('CHATBOT', 'checkOllamaOnStartup', { info: 'Error checking Ollama on startup', error });
      this.ollamaStatus = { installed: false, running: false, error: 'Error al verificar Ollama' };
      this.showOllamaModal = true;
    }
  }

  async startOllamaService(): Promise<void> {
    this.isStartingOllama = true;
    this.ollamaStartError = null;
    
    try {
      const result = await this.aiModelsService.startOllama();
      
      if (result.success) {
        // Esperar un momento y verificar el estado
        setTimeout(async () => {
          this.ollamaStatus = await this.aiModelsService.checkOllamaStatus();
          if (this.ollamaStatus.running) {
            this.showOllamaModal = false;
            // Recargar modelos después de iniciar Ollama
            await this.loadModels();
          }
          this.isStartingOllama = false;
        }, 3000);
      } else {
        this.ollamaStartError = result.error || 'Error desconocido al iniciar Ollama';
        this.isStartingOllama = false;
      }
    } catch (error: any) {
      this.logger.error('CHATBOT', 'startOllamaService', { info: 'Error starting Ollama', error });
      this.ollamaStartError = error?.message || 'Error al iniciar Ollama';
      this.isStartingOllama = false;
    }
  }

  closeOllamaModal(): void {
    this.showOllamaModal = false;
  }

  openSettings(): void {
    this.router.navigate(['/settings']);
    this.closeOllamaModal();
  }

  openOllamaWebsite(): void {
    if (window.agi?.openExternalLink) {
      window.agi.openExternalLink('https://ollama.com');
    } else {
      // Fallback para desarrollo
      window.open('https://ollama.com', '_blank');
    }
  }

  closeNoModelsModal() {
    this.showNoModelsModal = false;
  }

  navigateToModels() {
    this.showNoModelsModal = false;
    this.router.navigate(['/settings'], { fragment: 'models' });
  }
}
