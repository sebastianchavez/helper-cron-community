"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('agi', {
    runJob: (payload) => electron_1.ipcRenderer.invoke('job:run', payload),
    clearJob: () => electron_1.ipcRenderer.invoke('job:clear'),
    onJobEvent: (cb) => {
        const handler = (_, payload) => cb(payload);
        electron_1.ipcRenderer.on('job:event', handler);
        return () => electron_1.ipcRenderer.removeListener('job:event', handler);
    },
    onJobLog: (cb) => {
        const handler = (_, payload) => cb(payload);
        electron_1.ipcRenderer.on('job:log', handler);
        return () => electron_1.ipcRenderer.removeListener('job:log', handler);
    },
    onJobActions: (cb) => {
        const handler = (_, payload) => cb(payload);
        electron_1.ipcRenderer.on('job:actions', handler);
        return () => electron_1.ipcRenderer.removeListener('job:actions', handler);
    },
    getFileDiff: (payload) => electron_1.ipcRenderer.invoke('file:diff', payload),
    chat: {
        listModels: () => electron_1.ipcRenderer.invoke('ollama:models'),
        downloadModel: (modelName) => electron_1.ipcRenderer.invoke('ollama:download-model', modelName),
        send: (messages, model = 'llama3') => electron_1.ipcRenderer.invoke('ollama:chat', { messages, model }),
        stream: (messages, model, onChunk, onDone, onError) => {
            // Listener para chunks
            const chunkHandler = (_, payload) => {
                onChunk(payload.content);
            };
            // Listener para finalización
            const doneHandler = () => {
                cleanup();
                onDone();
            };
            // Listener para errores
            const errorHandler = (_, payload) => {
                cleanup();
                onError(payload.error);
            };
            const cleanup = () => {
                electron_1.ipcRenderer.removeListener('ollama:chat:stream:chunk', chunkHandler);
                electron_1.ipcRenderer.removeListener('ollama:chat:stream:done', doneHandler);
                electron_1.ipcRenderer.removeListener('ollama:chat:stream:error', errorHandler);
            };
            // Registrar listeners
            electron_1.ipcRenderer.on('ollama:chat:stream:chunk', chunkHandler);
            electron_1.ipcRenderer.on('ollama:chat:stream:done', doneHandler);
            electron_1.ipcRenderer.on('ollama:chat:stream:error', errorHandler);
            // Iniciar streaming
            electron_1.ipcRenderer.send('ollama:chat:stream', { messages, model });
            // Retornar función para cancelar
            return cleanup;
        }
    },
    plan: {
        generate: (userMessage, model = 'llama3') => electron_1.ipcRenderer.invoke('ollama:plan', { userMessage, model }),
    },
    chatDb: {
        createConversation: (title, folderId) => electron_1.ipcRenderer.invoke('chat:conversation:create', title, folderId),
        listConversations: () => electron_1.ipcRenderer.invoke('chat:conversation:list'),
        getConversationsByFolder: (folderId) => electron_1.ipcRenderer.invoke('chat:conversation:by-folder', folderId),
        addMessage: (payload) => electron_1.ipcRenderer.invoke('chat:message:add', payload),
        getMessages: (conversationId) => electron_1.ipcRenderer.invoke('chat:message:list', conversationId),
        deleteConversation: (conversationId) => electron_1.ipcRenderer.invoke('chat:conversation:delete', conversationId),
        restoreConversation: (conversationId) => electron_1.ipcRenderer.invoke('chat:conversation:restore', conversationId),
        permanentDeleteConversation: (conversationId) => electron_1.ipcRenderer.invoke('chat:conversation:permanent-delete', conversationId),
        listDeletedConversations: () => electron_1.ipcRenderer.invoke('chat:conversation:list-deleted'),
        updateConversationTitle: (conversationId, title) => electron_1.ipcRenderer.invoke('chat:conversation:updateTitle', { conversationId, title }),
        moveConversationToFolder: (conversationId, folderId) => electron_1.ipcRenderer.invoke('chat:conversation:move-to-folder', { conversationId, folderId }),
    },
    folder: {
        create: (name, parentId) => electron_1.ipcRenderer.invoke('folder:create', name, parentId),
        list: (parentId) => electron_1.ipcRenderer.invoke('folder:list', parentId),
        tree: () => electron_1.ipcRenderer.invoke('folder:tree'),
        getById: (id) => electron_1.ipcRenderer.invoke('folder:get-by-id', id),
        update: (id, name) => electron_1.ipcRenderer.invoke('folder:update', id, name),
        delete: (id) => electron_1.ipcRenderer.invoke('folder:delete', id),
        move: (folderId, newParentId) => electron_1.ipcRenderer.invoke('folder:move', folderId, newParentId),
        getWithCount: () => electron_1.ipcRenderer.invoke('folder:get-with-count'),
    },
    ollama: {
        checkStatus: () => electron_1.ipcRenderer.invoke('ollama:check-status'),
        startService: () => electron_1.ipcRenderer.invoke('ollama:start-service'),
        isInstalled: () => electron_1.ipcRenderer.invoke('ollama:is-installed'),
    },
    // APIs de perfil de usuario
    userProfile: {
        get: () => electron_1.ipcRenderer.invoke('user-profile:get'),
        save: (profile) => electron_1.ipcRenderer.invoke('user-profile:save', profile),
        delete: () => electron_1.ipcRenderer.invoke('user-profile:delete'),
    },
});
