import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, NgZone, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ExecutionEngineService } from '../../core/services/execution-engine/execution-engine.service';
import { ChatService } from '../../core/services/chat/chat.service';
import { FolderSidebarComponent } from '../../core/components/folder-sidebar/folder-sidebar.component';
import { FolderService } from '../../core/services/folder/folder.service';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UserService } from '../../core/services/user/user.service';
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
  input = '';
  messages: any[] = [];

  models: any[] = [];
  selectedModel = 'llama3';
  showModelDropdown = false;

  // Lista blanca de modelos permitidos
  private allowedModels = ['llama3', 'gpt4all', 'mistral', 'vicuna', 'stablelm', 'wizardlm', 'guanaco', 'alpaca', 'airoboros', 'dolly', 'koala', 'phi', 'pythia', 'cerebras', 'gemini', 'claude', 'falcon', 'airoboros', 'mistral', 'qwen', 'xgen'];

  loading = false;
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

  currentConversationId: string | null = null;

  private shouldScrollToBottom = false;

  conversations: any[] = [];
  selectedConversationId: string | null = null;
  selectedFolderId: string | null = null;
  isDragging = false;
  draggedConversationId: string | null = null;
  showUserMenu = false;
  isDarkMode = false;


  constructor(
    private engine: ExecutionEngineService,
    private chat: ChatService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private folderService: FolderService,
    private router: Router,
    private translationService: TranslationService,
    private userService: UserService
  ) {
    this.chat.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.shouldScrollToBottom = true;
    });
  }

  async ngOnInit(): Promise<void> {
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
    console.log('[CHAT] loadConversations called'); // Debug
    this.conversations = await window.agi?.chatDb.listConversations() || [];
    console.log(`[CHAT] Loaded ${this.conversations.length} root conversations`, this.conversations); // Debug
  }

  async openConversation(conversationId: string) {
    // Forzar reseteo del estado si está cargando para asegurar que el chat se habilite
    if (this.loading) {
      this.stopResponse(); // Detener cualquier operación en curso
    }

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

    // 4️⃣ asegurar que el chat esté habilitado
    this.loading = false;
    this.isStreaming = false;
    this.shouldScrollToBottom = true;
  }

  async newConversation() {
    const conv = await window.agi?.chatDb.createConversation('Nuevo chat', this.selectedFolderId || undefined);
    this.conversations.unshift(conv);
    await this.openConversation(conv.id);
  }

  async loadModels() {
    if (window.agi?.chat.listModels) {
      try {
        const allModels = await window.agi.chat.listModels();

        // Filtrar solo los modelos que están en la lista blanca
        this.models = allModels.filter(model => {
          return this.allowedModels.some(allowed =>
            model.name.toLowerCase().includes(allowed.toLowerCase())
          );
        });

        // Buscar llama3 en cualquier variante (llama3, llama3:latest, etc.)
        const llama3Model = this.models.find(m => 
          m.name.toLowerCase().startsWith('llama3')
        );

        if (llama3Model) {
          // Usar llama3 si está disponible
          this.selectedModel = llama3Model.name;
        } else if (this.models.length > 0) {
          // Si llama3 no está disponible, usar el primer modelo
          this.selectedModel = this.models[0].name;
        }
        // Si no hay modelos, mantiene 'llama3' como fallback
      } catch (error) {
        console.error('Error loading models:', error);
        // En caso de error, mantiene llama3 como fallback
      }
    }
  }

  selectModel(modelName: string) {
    this.selectedModel = modelName;
    this.showModelDropdown = false;
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
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
      console.error('Error al hacer scroll:', err);
    }
  }

  onEnterKey(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private buildContext(limit = 12) {
    return this.chat
      .getMessages()
      .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content.trim() !== '')
      .slice(-limit);
  }


  async send() {
    if (!this.input.trim()) return;

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
          const res = await window.agi?.chat.send(
            [
              {
                role: 'system',
                content:
                  'Genera un título corto (máximo 6 palabras) que resuma el mensaje del usuario. ' +
                  'No uses comillas, emojis ni puntuación final.',
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
              const conversationsByFolder = await window.agi?.chatDb.getConversationsByFolder?.(this.selectedFolderId) || [];
              this.conversations = conversationsByFolder;
            } else {
              await this.loadConversations();
            }
          }
        } catch (err) {
          console.warn('No se pudo generar título:', err);
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
              }
            }
          });
        },
        (error: string) => {
          // Ejecutar dentro de la zona de Angular
          this.ngZone.run(() => {
            // Error en streaming
            console.error('Error en streaming:', error);
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

    // Convertir saltos de línea en <br> solo en el texto que no es código
    formattedContent = formattedContent.replace(/\n/g, '<br>');

    // Restaurar los bloques de código
    codeBlocks.forEach((block, index) => {
      formattedContent = formattedContent.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  copyCodeToClipboard(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Código copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar código:', err);
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
          console.error('Error al decodificar código:', error);
        }
      }
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeForAttribute(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
  }

  async deleteConversation(event: MouseEvent, conversationId: string) {
    event.stopPropagation(); // Evitar que se abra la conversación
    
    if (!confirm('¿Eliminar esta conversación? Se puede restaurar desde la papelera.')) {
      return;
    }

    await window.agi?.chatDb.deleteConversation(conversationId);

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
  }

  async selectFolder(folderId: string | null) {
    console.log(`[CHAT] selectFolder called with folderId: ${folderId}`); // Debug
    this.selectedFolderId = folderId;
    
    if (folderId) {
      // Cargar solo las conversaciones de la carpeta para el sidebar
      const conversationsByFolder = await window.agi?.chatDb.getConversationsByFolder?.(folderId) || [];
      console.log(`[CHAT] Found ${conversationsByFolder.length} conversations in folder ${folderId}`, conversationsByFolder); // Debug
      
      // Marcar las conversaciones para distinguir entre carpeta y root
      this.conversations = [
        ...conversationsByFolder.map((conv: any) => ({...conv, isFromSelectedFolder: true})),
        ...(await window.agi?.chatDb.listConversations?.() || []).map((conv: any) => ({...conv, isFromSelectedFolder: false}))
      ];
    } else {
      console.log('[CHAT] Loading root conversations'); // Debug
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

  openSettings() {
    this.router.navigate(['/settings']);
    this.showUserMenu = false;
  }

  openAbout() {
    this.router.navigate(['/about']);
    this.showUserMenu = false;
  }

  closeApp() {
    // Por ahora solo cerrar el menú, la funcionalidad de cerrar app se puede implementar después
    console.log('Cerrar aplicación solicitado');
    this.showUserMenu = false;
    // Alternativamente, podrías usar window.close() pero puede no funcionar en Electron
    // window.close();
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
    console.log('moveConversationToFolder called:', data); // Debug
    
    try {
      // Verificar que el método existe
      if (!window.agi?.chatDb.moveConversationToFolder) {
        console.error('moveConversationToFolder method not found');
        return;
      }
      
      await window.agi.chatDb.moveConversationToFolder(data.conversationId, data.folderId);
      console.log('Move successful, updating UI...'); // Debug
      
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
      await this.folderService.loadFolders();
      
      console.log(`Conversación movida a carpeta ${data.folderId} - UI actualizada`);
    } catch (error) {
      console.error('Error moviendo conversación:', error);
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
}
