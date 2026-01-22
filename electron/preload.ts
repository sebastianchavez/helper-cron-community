import { contextBridge, ipcRenderer } from 'electron';

type ActionVerb = 'create' | 'update' | 'delete' | 'read';
type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface ActionExecution {
  id: string;
  verb: ActionVerb;
  title: string;
  status: ActionStatus;
}

export interface LogEntry {
  timestamp: string; // ISO
  message: string;
  level: 'info' | 'success' | 'error';
}

contextBridge.exposeInMainWorld('agi', {
  runJob: (payload: { actions: any[]; projectRoot: string }) =>
    ipcRenderer.invoke('job:run', payload),
  clearJob: () => ipcRenderer.invoke('job:clear'),

  onJobEvent: (cb: (evt: any) => void) => {
    const handler = (_: any, payload: any) => cb(payload);
    ipcRenderer.on('job:event', handler);
    return () => ipcRenderer.removeListener('job:event', handler);
  },
  onJobLog: (cb: (log: LogEntry) => void) => {
    const handler = (_: any, payload: LogEntry) => cb(payload);
    ipcRenderer.on('job:log', handler);
    return () => ipcRenderer.removeListener('job:log', handler);
  },
  onJobActions: (cb: (actions: ActionExecution[]) => void) => {
    const handler = (_: any, payload: ActionExecution[]) => cb(payload);
    ipcRenderer.on('job:actions', handler);
    return () => ipcRenderer.removeListener('job:actions', handler);
  },
  getFileDiff: (payload: { projectRoot: string; path: string; content: string }) =>
    ipcRenderer.invoke('file:diff', payload),
  chat: {
    listModels: () => ipcRenderer.invoke('ollama:models'),
    downloadModel: (modelName: string) => ipcRenderer.invoke('ollama:download-model', modelName),
    deleteModel: (modelName: string) => ipcRenderer.invoke('ollama:delete-model', modelName),
    
    onDownloadProgress: (cb: (progress: {
      modelName: string;
      status: string;
      progress?: number;
      completed?: number;
      total?: number;
      error?: string;
    }) => void) => {
      const handler = (_: any, payload: any) => cb(payload);
      ipcRenderer.on('ollama:download-progress', handler);
      return () => ipcRenderer.removeListener('ollama:download-progress', handler);
    },

    send: (messages: any[], model = 'llama3') =>
      ipcRenderer.invoke('ollama:chat', { messages, model }),

    stream: (
      messages: any[],
      model: string,
      onChunk: (chunk: string) => void,
      onDone: () => void,
      onError: (error: string) => void
    ) => {
      // Listener para chunks
      const chunkHandler = (_: any, payload: { content: string }) => {
        onChunk(payload.content);
      };

      // Listener para finalización
      const doneHandler = () => {
        cleanup();
        onDone();
      };

      // Listener para errores
      const errorHandler = (_: any, payload: { error: string }) => {
        cleanup();
        onError(payload.error);
      };

      const cleanup = () => {
        ipcRenderer.removeListener('ollama:chat:stream:chunk', chunkHandler);
        ipcRenderer.removeListener('ollama:chat:stream:done', doneHandler);
        ipcRenderer.removeListener('ollama:chat:stream:error', errorHandler);
      };

      // Registrar listeners
      ipcRenderer.on('ollama:chat:stream:chunk', chunkHandler);
      ipcRenderer.on('ollama:chat:stream:done', doneHandler);
      ipcRenderer.on('ollama:chat:stream:error', errorHandler);

      // Iniciar streaming
      ipcRenderer.send('ollama:chat:stream', { messages, model });

      // Retornar función para cancelar
      return cleanup;
    }
  },
  plan: {
    generate: (userMessage: string, model = 'llama3') =>
      ipcRenderer.invoke('ollama:plan', { userMessage, model }),
  },
  chatDb: {
    createConversation: (title?: string, folderId?: string) =>
      ipcRenderer.invoke('chat:conversation:create', title, folderId),
    listConversations: () =>
      ipcRenderer.invoke('chat:conversation:list'),
    getConversationsByFolder: (folderId: string) =>
      ipcRenderer.invoke('chat:conversation:by-folder', folderId),
    addMessage: (payload: {
      conversationId: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
    }) =>
      ipcRenderer.invoke('chat:message:add', payload),
    getMessages: (conversationId: string) =>
      ipcRenderer.invoke('chat:message:list', conversationId),
    deleteConversation: (conversationId: string) =>
      ipcRenderer.invoke('chat:conversation:delete', conversationId),
    restoreConversation: (conversationId: string) =>
      ipcRenderer.invoke('chat:conversation:restore', conversationId),
    permanentDeleteConversation: (conversationId: string) =>
      ipcRenderer.invoke('chat:conversation:permanent-delete', conversationId),
    listDeletedConversations: () =>
      ipcRenderer.invoke('chat:conversation:list-deleted'),
    updateConversationTitle: (conversationId: string, title: string) =>
      ipcRenderer.invoke('chat:conversation:updateTitle', { conversationId, title }),
    moveConversationToFolder: (conversationId: string, folderId?: string) =>
      ipcRenderer.invoke('chat:conversation:move-to-folder', { conversationId, folderId }),
  },
  folder: {
    create: (name: string, parentId?: string) =>
      ipcRenderer.invoke('folder:create', name, parentId),
    list: (parentId?: string) =>
      ipcRenderer.invoke('folder:list', parentId),
    tree: () =>
      ipcRenderer.invoke('folder:tree'),
    getById: (id: string) =>
      ipcRenderer.invoke('folder:get-by-id', id),
    update: (id: string, name: string) =>
      ipcRenderer.invoke('folder:update', id, name),
    delete: (id: string) =>
      ipcRenderer.invoke('folder:delete', id),
    move: (folderId: string, newParentId?: string) =>
      ipcRenderer.invoke('folder:move', folderId, newParentId),
    getWithCount: () =>
      ipcRenderer.invoke('folder:get-with-count'),
  },
  ollama: {
    checkStatus: () => ipcRenderer.invoke('ollama:check-status'),
    startService: () => ipcRenderer.invoke('ollama:start-service'),
    isInstalled: () => ipcRenderer.invoke('ollama:is-installed'),
  },

  // APIs de perfil de usuario
  userProfile: {
    get: () => ipcRenderer.invoke('user-profile:get'),
    save: (profile: { name: string }) => ipcRenderer.invoke('user-profile:save', profile),
    delete: () => ipcRenderer.invoke('user-profile:delete'),
  },

  // API para abrir enlaces externos
  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),
  
  // APIs de terminal
  executeTerminalCommand: (command: string) => ipcRenderer.invoke('terminal:execute', command),
});
