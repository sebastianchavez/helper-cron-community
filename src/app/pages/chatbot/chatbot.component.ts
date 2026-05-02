import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, NgZone, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat/chat.service';
import { ConversationSidebarComponent } from '../../core/components/conversation-sidebar/conversation-sidebar.component';
import { FolderService } from '../../core/services/folder/folder.service';
import { TranslationService } from '../../core/services/translation/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { AIModelsService } from '../../core/services/ai-models/ai-models.service';
import { FileCreationService, FileCreationResult } from '../../core/services/file-creation/file-creation.service';
import { ContentProcessingService } from '../../core/services/content-processing/content-processing.service';
import { ConversationManagementService } from '../../core/services/conversation-management/conversation-management.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { MessagesAreaComponent } from '../../core/components/messages-area/messages-area.component';
import { ChatInputComponent } from '../../core/components/chat-input/chat-input.component';
import { NgxSimpliAlertService } from 'ngx-simpli-alert';
import { ChatMessageService } from '../../core/services/chat-message/chat-message.service';
import { TitleGenerationService } from '../../core/services/title-generation/title-generation.service';
import { OllamaManagementService } from '../../core/services/ollama-management/ollama-management.service';
import { ChatUIService } from '../../core/services/chat-ui/chat-ui.service';
import { AIProvidersService, ProviderGroup, ProviderModel } from '../../core/services/ai-providers/ai-providers.service';
import { 
  LanguageHelper, 
  ModelHelper,
  FileHelper,
} from '../../shared/helpers';
import { NavigationMenuComponent } from '../../core/components/navigation-menu/navigation-menu.component';

@Component({
  selector: 'app-chatbot',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavigationMenuComponent,
    ConversationSidebarComponent,
    MessagesAreaComponent,
    ChatInputComponent,
    TranslatePipe
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild(MessagesAreaComponent) private messagesArea!: MessagesAreaComponent;
  @ViewChild('chatInput') private chatInputComponent!: ChatInputComponent;
  
  input = '';
  messages: any[] = [];
  private isCreatingNewConversation = false; // Flag para indicar si se está creando nueva conversación

  models: any[] = [];
  selectedModel = '';
  showModelDropdown = false;
  modelFilter = '';
  collapsedLocalSection = false;

  // Provider groups for the new multi-provider dropdown
  providerGroups: ProviderGroup[] = [];

  get filteredLocalModels(): any[] {
    const localGroup = this.providerGroups.find(g => g.id === 'ollama-local');
    const items = localGroup?.models ?? this.models;
    if (!this.modelFilter.trim()) return items;
    const f = this.modelFilter.toLowerCase();
    return items.filter((m: ProviderModel | any) =>
      (m.displayName ?? m.name ?? '').toLowerCase().includes(f)
    );
  }

  // Service state properties - now managed by services
  // Getters para acceder al estado de los servicios
  get loading(): boolean {
    return this.chatUIService.getState().loading;
  }

  get isStreaming(): boolean {
    return this.chatUIService.getState().isStreaming;
  }

  get typingText(): string {
    return this.chatUIService.getState().typingText;
  }

  get streamingDots(): string {
    return this.chatUIService.getState().streamingDots;
  }

  get streamingMessageId(): string | null {
    return this.chatUIService.getState().streamingMessageId;
  }

  get showNoModelsModal(): boolean {
    return this.chatUIService.getState().showNoModelsModal;
  }
  
  private streamCleanup: (() => void) | null = null;
  private shouldAutoScroll = true;
  private lastMessageCount = 0;
  
  currentConversationId: string | null = null;
  currentConversation: any = null;
  conversations: any[] = [];
  selectedConversationId: string | null = null;
  selectedFolderId: string | null = null;
  isDragging = false;
  associatedFolderPath: string | null = null;

  constructor(
    private chat: ChatService,
    private ngZone: NgZone,
    private folderService: FolderService,
    private router: Router,
    private translationService: TranslationService,
    private aiModelsService: AIModelsService,
    private fileCreationService: FileCreationService,
    private contentProcessingService: ContentProcessingService,
    private conversationManagementService: ConversationManagementService,
    private logger: LoggerService,
    private alertService: NgxSimpliAlertService,
    private chatMessageService: ChatMessageService,
    private titleGenerationService: TitleGenerationService,
    private ollamaManagementService: OllamaManagementService,
    private chatUIService: ChatUIService,
    private aiProvidersService: AIProvidersService
  ) {
    // Subscribe to chat messages
    this.chat.messages$.subscribe(msgs => {
      this.messages = msgs;
    });

  }

  async ngOnInit(): Promise<void> {
    
    // Cargar modelos primero para establecer el modelo por defecto
    await this.loadModels();
    
    // Cargar conversaciones
    await this.loadConversations();

    if (this.conversations.length > 0) {
      await this.openConversation(this.conversations[0].id);
    } else {
      await this.newConversation();
    }
  }

  async loadConversations() {
    // Delegar al servicio
    const result = await this.conversationManagementService.loadConversations(this.selectedFolderId);
    this.conversations = result.conversations;
    this.logger.log('CHAT', 'loadConversations', {
      info: `Loaded ${this.conversations.length} conversations`,
      response: { selectedFolderId: this.selectedFolderId, conversationsCount: this.conversations.length }
    });
  }

  async openConversation(conversationId: string) {
    // Forzar reseteo del estado si está cargando para asegurar que el chat se habilite
    if (this.loading) {
      this.onStopResponse(); // Detener cualquier operación en curso
    }
    
    // Si ya hay una conversación activa, evitar cargas duplicadas
    if (this.currentConversationId === conversationId) {
      this.logger.log('CHAT', 'openConversation', {
        info: 'Conversación ya activa, saltando carga',
        response: { conversationId }
      });
      return;
    }
    
    // Asegurar que el estado esté limpio antes de cargar
    this.chatUIService.resetLoadingState();
    this.chat.clear();
    this.messages = []; // Limpiar también la propiedad del componente
    this.associatedFolderPath = null;
    this.currentConversationId = null;
    this.currentConversation = null;

    try {
      this.logger.logWithEmoji('CHAT', 'openConversation', {
        info: 'Iniciando carga de conversación',
        response: { conversationId }
      }, '🔄');
      
      // Delegar al servicio para cargar la conversación
      const openResult = await this.conversationManagementService.openConversation(conversationId);
      
      this.logger.logWithEmoji('CHAT', 'openConversation', {
        info: 'Datos recibidos del servicio',
        response: { 
          conversationExists: !!openResult.conversation,
          messagesCount: openResult.messages.length,
          associatedFolder: openResult.conversation?.associated_folder_path 
        }
      }, '📋');
      
      // Actualizar estado del componente con los datos cargados
      this.selectedConversationId = conversationId;
      this.currentConversationId = conversationId;
      this.currentConversation = openResult.conversation;

      // Cargar carpeta asociada si existe
      if (this.currentConversation?.associated_folder_path) {
        this.associatedFolderPath = this.currentConversation.associated_folder_path;
        this.logger.logWithEmoji('CHAT', 'openConversation', {
          info: 'Carpeta asociada cargada',
          response: this.associatedFolderPath
        }, '📁');
      } else {
        this.associatedFolderPath = null;
        this.logger.logWithEmoji('CHAT', 'openConversation', {
          info: 'Sin carpeta asociada',
          response: { conversationId }
        }, '📁');
      }

      // 1️⃣ reconstruir ChatService con los mensajes cargados (ya se limpió arriba)
      this.logger.logWithEmoji('CHAT', 'openConversation', {
        info: 'Iniciando reconstrucción de mensajes',
        response: { messagesToLoad: openResult.messages.length }
      }, '🧹');

      // 2️⃣ reconstruir ChatService con los mensajes cargados
      for (const msg of openResult.messages) {
        if (msg.role === 'user') {
          this.chat.addUserMessage(msg.content);
          this.logger.log('CHAT', 'openConversation', {
            info: 'Mensaje de usuario agregado',
            response: { content: msg.content.substring(0, 50) + '...' }
          });
        } else if (msg.role === 'assistant') {
          this.chat.addAssistantMessage(msg.content);
          this.logger.log('CHAT', 'openConversation', {
            info: 'Mensaje de asistente agregado',
            response: { content: msg.content.substring(0, 50) + '...' }
          });
        }
      }
      
      this.logger.logWithEmoji('CHAT', 'openConversation', {
        info: 'Todos los mensajes cargados',
        response: { 
          totalMessages: openResult.messages.length,
          chatServiceMessages: this.chat.getMessages().length 
        }
      }, '✅');
      
      // Actualizar propiedad messages para el binding en la UI
      this.messages = [...this.chat.getMessages()];

      // 3️⃣ asegurar que el chat esté habilitado
      this.chatUIService.resetLoadingState();
      
      // 4️⃣ Forzar detección de cambios y scroll
      this.shouldAutoScroll = true;
      setTimeout(() => {
        this.forceScrollToBottom();
        this.logger.logWithEmoji('CHAT', 'openConversation', {
          info: 'Conversación cargada completamente',
          response: { 
            conversationId,
            associatedFolder: this.associatedFolderPath,
            messagesVisible: this.chat.getMessages().length,
            messagesProperty: this.messages.length,
            hasFolder: !!this.associatedFolderPath
          }
        }, '🎉');
      }, 100);
    } catch (error) {
      this.logger.error('CONVERSATION', 'openConversation', {
        info: 'Error loading conversation',
        error
      });
    }
  }

  async newConversation() {
    this.isCreatingNewConversation = true;
    const targetFolderId = this.selectedFolderId || undefined;
    const conv = await this.conversationManagementService.createConversation(
      'Nuevo chat',
      targetFolderId
    );
    this.conversations.unshift(conv);
    this.selectedConversationId = conv.id;
    if (!this.selectedFolderId) {
      await this.loadConversations();
    }
    this.isCreatingNewConversation = false;
    await this.openConversation(conv.id);
  }

  async loadModels() {
    try {
      const groups = await this.aiProvidersService.loadAll();
      this.providerGroups = groups;

      const localGroup = groups.find(g => g.id === 'ollama-local');
      this.models = localGroup?.models ?? [];

      // Restore saved model from localStorage if it still exists in any group
      const saved = localStorage.getItem('selectedModel');
      const allModels = this.aiProvidersService.getAllModels();
      if (saved && allModels.some(m => m.id === saved)) {
        this.selectedModel = saved;
      } else if (allModels.length > 0) {
        this.selectedModel = allModels[0].id;
        ModelHelper.saveSelectedModel(this.selectedModel);
      }
    } catch (error) {
      this.logger.error('MODELS', 'loadModels', { info: 'Error loading provider models', error });
    }
  }

  getStreamApi(modelName: string): { stream?: (...args: any[]) => () => void; send?: (...args: any[]) => Promise<any> } | undefined {
    return window.agi?.chat;
  }

  selectModel(modelName: string) {
    this.selectedModel = modelName;
    this.showModelDropdown = false;
    
    // Guardar el modelo seleccionado en localStorage
    ModelHelper.saveSelectedModel(modelName);
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
    if (!this.showModelDropdown) {
      this.modelFilter = '';
    }
  }

  formatModelSize(sizeInBytes: number): string {
    return ModelHelper.formatModelSize(sizeInBytes);
  }

  ngAfterViewChecked() {
    // Solo hacer scroll automático si cambió el número de mensajes o si se debe hacer scroll automático
    const currentMessageCount = this.messages.length;
    if (this.shouldAutoScroll || currentMessageCount !== this.lastMessageCount) {
      this.forceScrollToBottom();
      this.lastMessageCount = currentMessageCount;
      
      // Resetear el flag después de un tiempo para evitar scrolls continuos
      if (this.shouldAutoScroll) {
        setTimeout(() => {
          this.shouldAutoScroll = false;
        }, 1000);
      }
    }
  }

  onEnterKey(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onInputChange(value: string) {
    this.input = value;
  }

  onSendMessage() {
    this.send();
  }

  onStopResponse() {
    this.chatMessageService.stopResponse();
    this.chatUIService.resetLoadingState();
    
    // Si hay un mensaje parcial, mantenerlo
    const messages = this.chat.getMessages();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content.trim()) {
        lastMessage.content = lastMessage.content + '\n\n*[Respuesta detenida por el usuario]*';
        this.messages = [...messages];
      }
    }
  }
  
  onFilesSelected(event: {files: FileList, type: string}) {
    this.logger.log('FILES', 'onFilesSelected', {
      info: 'Archivos seleccionados',
      response: { 
        fileCount: event.files.length,
        type: event.type,
        files: Array.from(event.files).map(f => ({ name: f.name, size: f.size }))
      }
    });
  }

  async onFolderSelected(folderName: string) {
    this.logger.logWithEmoji('FOLDER', 'onFolderSelected', {
      info: 'Carpeta seleccionada para asociación',
      response: {
        folderName,
        currentConversationId: this.currentConversationId,
        previousAssociatedFolder: this.associatedFolderPath
      }
    }, '🗂️');
    
    // Guardar la carpeta asociada para operaciones del asistente
    this.associatedFolderPath = folderName;
    this.logger.logWithEmoji('FOLDER', 'onFolderSelected', {
      info: 'associatedFolderPath actualizada',
      response: { newPath: this.associatedFolderPath }
    }, '📁');
    
    // Si hay una conversación activa, guardar la asociación en la base de datos
    if (this.currentConversationId) {
      try {
        this.logger.log('FOLDER', 'onFolderSelected', {
          info: 'Llamando updateConversationAssociatedFolder',
          response: {
            conversationId: this.currentConversationId,
            folderPath: folderName
          }
        });
        
        const result = await (window as any).agi?.chatDb?.updateConversationAssociatedFolder?.(
          this.currentConversationId, 
          folderName
        );
        
        this.logger.log('FOLDER', 'onFolderSelected', {
          info: 'Resultado de updateConversationAssociatedFolder',
          response: result
        });
        
        if (result?.success) {
          this.logger.logWithEmoji('FOLDER', 'onFolderSelected', {
            info: 'Carpeta asociada guardada en BD',
            response: { folderName }
          }, '✅');
        } else {
          this.logger.error('FOLDER', 'onFolderSelected', {
            info: 'Error guardando carpeta asociada',
            error: result?.error
          });
        }
      } catch (error) {
        this.logger.error('FOLDER', 'onFolderSelected', {
          info: 'Error guardando carpeta asociada',
          error
        });
      }
    } else {
      this.logger.log('FOLDER', 'onFolderSelected', {
        info: 'No hay conversación activa. Carpeta será asociada al crear nueva conversación'
      });
    }
  }

  async removeAssociatedFolder() {
    if (!this.currentConversationId) {
      this.logger.log('FOLDER', 'removeAssociatedFolder', {
        info: 'No hay conversación activa'
      });
      return;
    }
    
    try {
      const result = await (window as any).agi?.chatDb?.removeConversationAssociatedFolder?.(
        this.currentConversationId
      );
      
      if (result?.success) {
        this.associatedFolderPath = null;
        this.logger.logWithEmoji('FOLDER', 'removeAssociatedFolder', {
          info: 'Carpeta asociada removida'
        }, '✅');
      } else {
        this.logger.error('FOLDER', 'removeAssociatedFolder', {
          info: 'Error removiendo carpeta asociada',
          error: result?.error
        });
      }
    } catch (error) {
      this.logger.error('FOLDER', 'removeAssociatedFolder', {
        info: 'Error removiendo carpeta asociada',
        error
      });
    }
  }

  getShortFolderName(folderPath: string): string {
    return FileHelper.getShortFolderName(folderPath);
  }

  private getTitleGenerationPrompt(languageCode: string): string {
    return LanguageHelper.getTitleGenerationPrompt(languageCode);
  }

  private getCapabilityInstructions(): string {
    let instructions = '## CAPACIDADES DISPONIBLES:\n\n';
    
    if (this.associatedFolderPath) {
      this.logger.logWithEmoji('CAPABILITY', 'getCapabilityInstructions', {
        info: 'Generando instrucciones para carpeta',
        response: { folderPath: this.associatedFolderPath }
      }, '📋');
      instructions += '### � CREACIÓN AUTOMÁTICA DE ARCHIVOS - MUY IMPORTANTE:\n\n';
      instructions += `**SIEMPRE que el usuario pida crear archivos, DEBES usar este formato EXACTO:**\n\n`;
      instructions += '```\n';
      instructions += '[CREAR_ARCHIVO: usuarios.json]\n';
      instructions += '{\n';
      instructions += '  "usuarios": [\n';
      instructions += '    {"id": 1, "nombre": "Juan"}\n';
      instructions += '  ]\n';
      instructions += '}\n';
      instructions += '[/CREAR_ARCHIVO]\n';
      instructions += '```\n\n';
      instructions += '**REGLAS OBLIGATORIAS:**\n';
      instructions += '- SIEMPRE usar [CREAR_ARCHIVO: nombrearchivo.ext] al inicio\n';
      instructions += '- SIEMPRE cerrar con [/CREAR_ARCHIVO] al final\n';
      instructions += '- El contenido va entre estos dos comandos\n';
      instructions += '- NO uses bloques de código ```json``` en su lugar\n';
      instructions += '- NO solo muestres el código, USA LOS COMANDOS\n\n';
      instructions += `**CARPETA DE TRABAJO:** ${this.associatedFolderPath}\n\n`;
      instructions += '**EJEMPLO COMPLETO para "crea archivo json con usuarios":**\n';
      instructions += 'Respuesta correcta:\n';
      instructions += 'Te ayudo a crear el archivo JSON con usuarios:\n\n';
      instructions += '[CREAR_ARCHIVO: usuarios.json]\n';
      instructions += '[\n';
      instructions += '  {\n';
      instructions += '    "id": 1,\n';
      instructions += '    "nombre": "Juan Pérez",\n';
      instructions += '    "email": "juan@example.com"\n';
      instructions += '  }\n';
      instructions += ']\n';
      instructions += '[/CREAR_ARCHIVO]\n\n';
      instructions += '✅ El archivo se creará automáticamente en tu carpeta.\n\n';
    } else {
      this.logger.warn('CAPABILITY', 'getCapabilityInstructions', {
        info: 'Sin carpeta asociada'
      });
      instructions += '### ℹ️ Sin carpeta de trabajo asociada\n';
      instructions += 'No hay carpeta asociada. Para crear archivos, el usuario debe asociar una carpeta primero.\n\n';
    }
    
    return instructions;
  }

  private getLanguageInstructions(languageCode: string): string {
    return this.contentProcessingService.getLanguageInstructions(languageCode);
  }



  /**
   * Procesa comandos de creación de archivos en las respuestas del modelo de IA
   * @param content Contenido de la respuesta del modelo
   * @returns Contenido procesado sin los comandos ejecutados
  /**
   * Process file creation commands in AI response
   * @param content Content from AI response
   * @returns Processed content with file creation results
   */
  private isFileCreationRequest(message: string): boolean {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Patrones que indican solicitud de creación de archivos
    const fileCreationPatterns = [
      /(?:crea|crear|cree|generar?|hacer|dame)\s+(?:un\s+)?archivo/i,
      /(?:puedes|podrías|puede)\s+crear\s+(?:un\s+)?archivo/i,
      /archivo\s+(?:de|con|que|para)/i,
      /(?:crear|generar)\s+(?:un\s+)?(?:documento|txt|md|json)/i,
      /(?:hacer|dame)\s+(?:un\s+)?(?:documento|archivo)/i
    ];
    
    return fileCreationPatterns.some(pattern => pattern.test(normalizedMessage));
  }

  private async processFileCreationCommands(content: string, userMessage: string, isExplicitCreation: boolean = false): Promise<FileCreationResult> {
    const result = await this.fileCreationService.processFileCreationCommands(
      content, 
      userMessage, 
      this.associatedFolderPath,
      isExplicitCreation
    );
    
    return result;
  }









  private buildContext(limit = 12) {
    const messagesForAPI = this.chat.getMessagesForAPI();
    const currentLanguage = this.translationService.getCurrentLanguage();
    
    return this.contentProcessingService.buildContext(
      messagesForAPI,
      currentLanguage,
      this.associatedFolderPath,
      limit
    );
  }


  async send() {
    if (!this.input.trim()) return;
    
    // Verificar y limpiar cualquier estado inconsistente
    if (this.loading && !this.isStreaming && !this.streamCleanup) {
      this.logger.warn('SEND', 'send', {
        info: 'Estado loading inconsistente detectado, reseteando'
      });
      this.chatUIService.resetLoadingState();
    }

    // Verificar si hay un modelo seleccionado
    if (!this.selectedModel || this.selectedModel.trim() === '') {
      // Si no hay modelo seleccionado pero hay modelos disponibles, mostrar dropdown
      if (this.models.length > 0) {
        this.showModelDropdown = true;
        return;
      }
    }

    // Verificar si hay modelos disponibles
    if (this.models.length === 0) {
      this.chatUIService.setNoModelsModalVisible(true);
      return;
    }

    const userMessage = this.chatInputComponent?.getCompleteMessage() || this.input;

    this.chat.addUserMessage(userMessage);
    this.input = '';
    this.chatInputComponent?.clearInput(); // Limpiar input del componente hijo
    
    // Activar auto-scroll y forzar scroll después de agregar mensaje del usuario
    this.shouldAutoScroll = true;
    this.forceScrollToBottom();

    // ⏳ Activar indicador de carga INMEDIATAMENTE
    this.chatUIService.setLoading(true);
    this.chatUIService.startTypingAnimation();
    
    // Timeout de seguridad para evitar que loading se quede activado (60 segundos)
    const loadingTimeout = setTimeout(() => {
      if (this.loading) {
        this.logger.warn('SEND', 'send', {
          info: 'Timeout de loading alcanzado, reseteando estado'
        });
        this.chatUIService.resetLoadingState();
        this.chat.addAssistantMessage('⚠️ Timeout: La respuesta tardó demasiado. Por favor, inténtalo nuevamente.');
      }
    }, 120000); // Aumentado a 2 minutos

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
          const titlePrompt = this.getTitleGenerationPrompt(currentLanguage);
          
          const titleSendApi = this.getStreamApi(this.selectedModel);
          const res = await titleSendApi?.send?.(
            [
              {
                role: 'system',
                content: titlePrompt
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
              // Usar selectFolder para mantener la estructura correcta
              await this.selectFolder(this.selectedFolderId);
            } else {
              await this.loadConversations();
            }
          }
        } catch (err) {
          this.logger.warn('TITLE', 'send', {
            info: 'No se pudo generar título',
            error: err
          });
        }
      }

    }

    // Construir contexto DESPUÉS de agregar el mensaje del usuario
    // pero ANTES de agregar el mensaje vacío del asistente
    const contextMessages = this.buildContext();

    // NO crear mensaje vacío aún, solo preparar el ID
    const messageId = Date.now().toString();

    // Usar streaming solo si no es una acción contextual
    const streamApi = this.getStreamApi(this.selectedModel);

    if (streamApi?.stream) {
      this.streamCleanup = streamApi.stream(
        contextMessages, // Ahora incluye el mensaje del usuario
        this.selectedModel,
        (chunk: string) => {
          // Ejecutar dentro de la zona de Angular para que detecte los cambios
          this.ngZone.run(() => {
            // Al recibir el primer chunk, crear el mensaje del asistente y cambiar estado
            if (!this.isStreaming) {
              // Crear el mensaje del asistente AHORA con el primer chunk
              this.chat.addAssistantMessage(chunk);
              // Generar messageId y activar streaming
              const messageId = this.generateMessageId();
              this.chatUIService.startStreaming(messageId);
              this.chatUIService.stopTypingAnimation();
              this.chatUIService.startDotsAnimation();
            } else {
              // Actualizar el último mensaje con el nuevo chunk
              this.updateStreamingMessage(chunk);
            }
          });
        },
        () => {
          // Ejecutar dentro de la zona de Angular
          this.ngZone.run(async () => {
            // Limpiar timeout de seguridad
            clearTimeout(loadingTimeout);
            
            // Streaming completado - resetear todo el estado
            this.chatUIService.resetLoadingState();
            this.streamCleanup = null;

            // 💾 Guardar mensaje assistant completo
            if (this.currentConversationId) {
              const messages = this.chat.getMessages();
              const last = messages[messages.length - 1];

              if (last?.role === 'assistant') {
                this.logger.logWithEmoji('FILE-PROCESSING', 'send', {
                  info: 'Procesando respuesta para comandos de archivo',
                  response: {
                    contentPreview: last.content.substring(0, 200),
                    associatedFolderPath: this.associatedFolderPath,
                    contentLength: last.content.length
                  }
                }, '📄');
                
                const fileResult = await this.processFileCreationCommands(
                  last.content, 
                  userMessage, 
                  false
                );
                
                this.logger.log('FILE-PROCESSING', 'send', {
                  info: 'Contenido procesado',
                  response: {
                    filesCreated: fileResult.filesCreated,
                    processedContentPreview: fileResult.content.substring(0, 200),
                    contentChanged: fileResult.content !== last.content,
                    originalLength: last.content.length,
                    processedLength: fileResult.content.length
                  }
                });
                
                // Actualizar el contenido si se procesaron comandos
                if (fileResult.content !== last.content) {
                  last.content = fileResult.content;
                  // Forzar actualización en la UI
                  this.messages = [...this.chat.getMessages()];
                }
                
                await window.agi?.chatDb.addMessage({
                  conversationId: this.currentConversationId,
                  role: 'assistant',
                  content: last.content,
                });
              }
            }
            
            // Enfocar el input después de completar la respuesta
            this.focusInputAfterResponse();
          });
        },
        (error: string) => {
          // Ejecutar dentro de la zona de Angular
          this.ngZone.run(() => {
            // Limpiar timeout de seguridad
            clearTimeout(loadingTimeout);
            
            // Error en streaming
            this.logger.error('STREAMING', 'send', {
              info: 'Error en streaming',
              error
            });
            this.chatUIService.resetLoadingState();
            this.streamCleanup = null;
            this.chat.addAssistantMessage(`Error: ${error}`);
            
            // Enfocar el input después del error
            this.focusInputAfterResponse();
          });
        }
      );
    } else {
      // Limpiar timeout de seguridad
      clearTimeout(loadingTimeout);
      
      // Fallback si no hay API de streaming disponible
      this.chatUIService.resetLoadingState();
      this.chat.addAssistantMessage('Error: API de chat no disponible');
      this.focusInputAfterResponse();
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
        // Forzar scroll después de actualizar
        this.forceScrollToBottom();
      }
    }
  }

  private forceScrollToBottom(): void {
    this.chatUIService.forceScrollToBottom(this.messagesContainer);
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enfoca el input después de completar una respuesta
   */
  private focusInputAfterResponse(): void {
    if (this.chatInputComponent) {
      setTimeout(() => {
        this.chatInputComponent.focusInput();
      }, 200); // Delay para asegurar que el DOM se haya actualizado
    }
  }
  
  ngOnDestroy() {
    // Cleanup services
    this.chatMessageService.cleanup();
    this.chatUIService.cleanup();
  }

  async deleteConversation(event: MouseEvent, conversationId: string) {
    event.stopPropagation(); // Evitar que se abra la conversación
    
    this.alertService.show({
      title: this.translationService.translate('conversations.deleteTitle'),
      description: this.translationService.translate('conversations.deleteConfirm'),
      type: 'question',
      confirmButtonText: this.translationService.translate('common.delete'),
      cancelButtonText: this.translationService.translate('common.cancel')
    }, 
    async () => {
      await window.agi?.chatDb.deleteConversation(conversationId);

      // Remover de la lista actual
      this.conversations = this.conversations.filter(c => c.id !== conversationId);

    // Si hay una carpeta seleccionada, refresca las conversaciones de esa carpeta
    if (this.selectedFolderId) {
      await this.selectFolder(this.selectedFolderId);
    }

    // Actualizar las carpetas para refrescar los contadores
    await this.folderService.loadFolders();

    // Si eliminamos la conversación activa, abrir otra o crear nueva
    if (this.currentConversationId === conversationId) {
      if (this.conversations.length > 0) {
        await this.openConversation(this.conversations[0].id);
      } else {
        await this.newConversation();
      }
    }
    });
  }

  async selectFolder(folderId: string | null) {
    this.logger.log('FOLDER', 'selectFolder', {
      info: 'Seleccionando carpeta',
      response: { folderId }
    });
    this.selectedFolderId = folderId;
    
    if (folderId) {
      // Cargar solo las conversaciones de la carpeta para el sidebar
      const folderResponse = await window.agi?.chatDb.getConversationsByFolder?.(folderId);
      
      let conversationsByFolder = [];
      const folderResponseObj = folderResponse as any;
      if (Array.isArray(folderResponse)) {
        conversationsByFolder = folderResponse;
      } else if (folderResponseObj && folderResponseObj.success) {
        conversationsByFolder = folderResponseObj.data || [];
      } else {
        this.logger.error('FOLDER', 'selectFolder', {
          info: 'Error loading folder conversations',
          error: folderResponseObj?.error
        });
      }
      
      this.logger.log('FOLDER', 'selectFolder', {
        info: `Found ${conversationsByFolder.length} conversations in folder`,
        response: { folderId, conversationCount: conversationsByFolder.length, conversations: conversationsByFolder }
      });
      
      // Cargar conversaciones root también
      const rootResponse = await window.agi?.chatDb.listConversations?.();
      let rootConversations = [];
      const rootResponseObj = rootResponse as any;
      if (Array.isArray(rootResponse)) {
        rootConversations = rootResponse;
      } else if (rootResponseObj && rootResponseObj.success) {
        rootConversations = rootResponseObj.data || [];
      }
      
      // Marcar las conversaciones para distinguir entre carpeta y root
      this.conversations = [
        ...conversationsByFolder.map((conv: any) => ({...conv, isFromSelectedFolder: true})),
        ...rootConversations.map((conv: any) => ({...conv, isFromSelectedFolder: false}))
      ];
      
      // Forzar actualización del componente de carpetas
      this.folderService.loadFolders();
    } else {
      this.logger.log('FOLDER', 'selectFolder', {
        info: 'Loading root conversations'
      });
      await this.loadConversations();
    }
  }

  onFolderCreated() {
    this.selectedFolderId = null;
    this.loadConversations();
    // Refrescar las carpetas para actualizar los contadores
    this.folderService.loadFolders();
  }

  async deleteConversationById(conversationId: string) {
    // Crear un evento dummy para usar el método existente
    const dummyEvent = new MouseEvent('click');
    await this.deleteConversation(dummyEvent, conversationId);
    
    // Si hay una carpeta seleccionada, recargar las conversaciones de esa carpeta
    if (this.selectedFolderId) {
      await this.selectFolder(this.selectedFolderId);
    }
    
    // Actualizar las carpetas para refrescar los contadores
    await this.folderService.loadFolders();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Element;
    
    // Cerrar dropdown del modelo si se hace clic fuera
    if (this.showModelDropdown && !target.closest('.relative')) {
      this.showModelDropdown = false;
    }
  }

  onDragStart(event: DragEvent, conversationId: string) {
    if (this.loading) {
      event.preventDefault();
      return;
    }
    
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', conversationId);
  }

  onDragEnd(event: DragEvent) {
    this.isDragging = false;
  }

  async moveConversationToFolder(data: {conversationId: string, folderId: string}) {
    this.logger.log('CONVERSATION', 'moveConversationToFolder', {
      info: 'Moving conversation to folder',
      response: data
    });
    
    try {
      // Delegar al servicio
      await this.conversationManagementService.moveConversationToFolder(data.conversationId, data.folderId);
      
      this.logger.log('CONVERSATION', 'moveConversationToFolder', {
        info: 'Move successful, updating UI'
      });
      
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
      
      this.logger.logWithEmoji('CONVERSATION', 'moveConversationToFolder', {
        info: `Conversación movida a carpeta ${data.folderId} - UI actualizada`
      }, '✅');
    } catch (error) {
      this.logger.error('CONVERSATION', 'moveConversationToFolder', {
        info: 'Error moviendo conversación',
        error: error
      });
    }
  }

  async createChatInFolder(folderId: string) {
    const conv = await this.conversationManagementService.createConversation('Nuevo chat', folderId);
    await this.selectFolder(folderId);
    await this.openConversation(conv.id);
  }

  // UI Modal methods - delegated to ChatUIService
  closeNoModelsModal() {
    this.chatUIService.hideNoModelsModal();
  }

  navigateToModels() {
    this.chatUIService.hideNoModelsModal();
    this.router.navigate(['/settings'], { fragment: 'models' });
  }

  openDeveloperMode() {
    this.router.navigate(['/developer-mode']);
  }

  openSettings(): void {
    this.ollamaManagementService.openSettings();
  }

  /**
   * Precarga el modelo guardado del usuario enviando una consulta simple
   * para que Ollama lo tenga listo en memoria
   */
  private async preloadSavedModel(): Promise<void> {
    const savedModel = ModelHelper.getSavedModel(this.models, this.logger);
    if (savedModel) {
      await ModelHelper.preloadModel(savedModel, window.agi?.chat, this.logger);
    }
  }

}

