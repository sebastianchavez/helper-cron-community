export { };

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
  };
}

// Declaración global para Node.js
declare global {
    var setOllamaStartedByApp: (started: boolean) => void;
}

declare global {
    interface Window {
        agi?: {
            runJob: (payload: {
                actions: any[];
                projectRoot: string;
            }) => Promise<{ ok: boolean; jobId: string }>;
            clearJob: () => Promise<{ ok: boolean }>;

            onJobEvent: (cb: (evt: any) => void) => () => void;
            onJobLog: (cb: (log: any) => void) => () => void;
            onJobActions: (cb: (actions: any[]) => void) => () => void;
            getFileDiff: (payload: {
                projectRoot: string;
                path: string;
                content: string;
            }) => Promise<{ before: string | null; after: string }>;
            chat: {
                listModels: () => Promise<OllamaModel[]>;
                downloadModel: (modelName: string) => Promise<{ success: boolean; error?: string }>;
                deleteModel: (modelName: string) => Promise<{ success: boolean; error?: string }>;
                onDownloadProgress: (cb: (progress: {
                    modelName: string;
                    status: string;
                    progress?: number;
                    completed?: number;
                    total?: number;
                    error?: string;
                    phase?: string;
                }) => void) => () => void;
                send: (messages: any[], model?: string) => Promise<{ content: string }>;
                stream: (
                    messages: any[], 
                    model: string,
                    onChunk: (chunk: string) => void,
                    onDone: () => void,
                    onError: (error: string) => void
                ) => () => void;
            };
            chatDb: {
                createConversation(title?: string, folderId?: string): Promise<any>;
                listConversations(): Promise<any[]>;
                getConversationsByFolder(folderId: string): Promise<any[]>;
                getConversation(conversationId: string): Promise<any>;
                addMessage(payload: {
                    conversationId: string;
                    role: 'user' | 'assistant' | 'system';
                    content: string;
                }): Promise<any>;
                getMessages(conversationId: string): Promise<any[]>;
                deleteConversation(conversationId: string): Promise<void>;
                updateConversationTitle(conversationId: string, title: string): Promise<void>;
                moveConversationToFolder(conversationId: string, folderId?: string): Promise<void>;
                updateConversationAssociatedFolder(conversationId: string, folderPath: string): Promise<any>;
                removeConversationAssociatedFolder(conversationId: string): Promise<any>;
            };
            folder: {
                create(name: string, parentId?: string): Promise<any>;
                list(parentId?: string): Promise<any[]>;
                tree(): Promise<any[]>;
                getById(id: string): Promise<any>;
                update(id: string, name: string): Promise<void>;
                delete(id: string): Promise<void>;
                move(folderId: string, newParentId?: string): Promise<void>;
                getWithCount(): Promise<any[]>;
                listContents(dirPath: string): Promise<{ success: boolean; contents?: string[]; error?: string }>;
                selectDialog(): Promise<{ success: boolean; folderPath?: string; canceled?: boolean; error?: string }>;
            };
            file: {
                writeText(filePath: string, content: string, options?: { overwrite?: boolean }): Promise<{ success: boolean; filePath?: string; size?: number; created?: boolean; updated?: boolean; exists?: boolean; error?: string }>;
                readText(filePath: string): Promise<{ success: boolean; content?: string; size?: number; error?: string }>;
            };
            userProfile: {
                get(): Promise<{ success: boolean; data?: any; error?: string }>;
                save(profile: { name: string }): Promise<{ success: boolean; data?: any; error?: string }>;
                delete(): Promise<{ success: boolean; error?: string }>;
            };
            ollama: {
                checkStatus(): Promise<{ installed: boolean; running: boolean; error?: string }>;
                startService(): Promise<{ success: boolean; error?: string }>;
                isInstalled(): Promise<boolean>;
            };
            flow: {
                list(): Promise<any[]>;
                get(id: string): Promise<any>;
                create(data: { name: string; description?: string; icon?: string; iconColor?: string; iconBg?: string }): Promise<any>;
                update(id: string, data: {
                    name?: string; description?: string; icon?: string; iconColor?: string; iconBg?: string;
                    blocksCount?: number; canvasBlocks?: string; connections?: string; endNodes?: string;
                    startNodeX?: number; startNodeY?: number;
                    scheduleType?: string; intervalValue?: number; intervalUnit?: string;
                    specificTime?: string; selectedDays?: string; enabled?: number;
                }): Promise<any>;
                delete(id: string): Promise<void>;
                duplicate(id: string): Promise<any>;
            };
            executionLog: {
                listByRange(from: string, to: string): Promise<any[]>;
                listByFlow(flowId: string, limit?: number): Promise<any[]>;
            };
            openExternalLink: (url: string) => Promise<{ success: boolean; error?: string }>;
            showItemInFolder: (filePath: string) => Promise<{ success: boolean; error?: string }>;
            executeTerminalCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string; exitCode?: number }>;
            startTerminalProcess: (command: string, processId?: string) => Promise<{ success: boolean; output?: string; error?: string }>;
            stopTerminalProcess: (processId: string) => Promise<{ success: boolean; output?: string; error?: string }>;
            listTerminalProcesses: () => Promise<string[]>;
        };
        electronAPI?: {
            showWindow: () => Promise<{ success: boolean; error?: string }>;
            restoreWindow: () => Promise<{ success: boolean; error?: string }>;
            minimizeWindow: () => Promise<{ success: boolean; error?: string }>;
            maximizeWindow: () => Promise<{ success: boolean; error?: string }>;
            closeWindow: () => Promise<{ success: boolean; error?: string }>;
        };
    }
}
