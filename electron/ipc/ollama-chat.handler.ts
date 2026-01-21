import { ipcMain } from 'electron';

export function registerOllamaChatHandler() {
  // Handler para listar modelos disponibles
  ipcMain.handle('ollama:models', async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
      });

      const data = await res.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  });

  ipcMain.handle(
    'ollama:chat',
    async (_evt, payload: { messages: any[]; model: string }) => {
      try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: payload.model,
          messages: payload.messages,
          stream: false,
        }),
      });

      console.log('ollama chat body:', JSON.stringify({
        model: payload.model,
        messages: payload.messages,
        stream: false,
      }));
      

      const data = await res.json();

      return {
        content: data.message.content,
      };
    } catch (error: any) {
      console.log('Error: ', error);
    }
    },
  );

  // Nuevo handler para streaming
  ipcMain.on(
    'ollama:chat:stream',
    async (event, payload: { messages: any[]; model: string }) => {
      try {
        const res = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: payload.model,
            messages: payload.messages,
            stream: true,
          }),
        });

        console.log('ollama:chat:stream - Request:', JSON.stringify({
          model: payload.model,
          messages: payload.messages,
          stream: true,
        }));
        console.log('ollama:chat:stream - Response status:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('ollama:chat:stream - Error response:', errorText);
          event.reply('ollama:chat:stream:error', { error: `HTTP ${res.status}: ${errorText}` });
          return;
        }

        if (!res.body) {
          event.reply('ollama:chat:stream:error', { error: 'No response body' });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        console.log('ollama:chat:stream - Starting to read stream...');
        let chunkCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log(`ollama:chat:stream - Stream completed. Total chunks: ${chunkCount}`);
            event.reply('ollama:chat:stream:done');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('ollama:chat:stream - Raw chunk:', chunk);
          
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              console.log('ollama:chat:stream - Parsed JSON:', JSON.stringify(json));
              
              if (json.message?.content) {
                chunkCount++;
                event.reply('ollama:chat:stream:chunk', { content: json.message.content });
              }
              
              // Verificar si hay error en la respuesta
              if (json.error) {
                console.error('ollama:chat:stream - Error in response:', json.error);
                event.reply('ollama:chat:stream:error', { error: json.error });
                return;
              }
            } catch (e) {
              console.warn('ollama:chat:stream - Failed to parse line:', line, e);
            }
          }
        }
      } catch (error: any) {
        event.reply('ollama:chat:stream:error', { error: error.message });
      }
    }
  );

  // Handler para descargar modelos
  ipcMain.handle('ollama:download-model', async (_evt, modelName: string) => {
    try {
      console.log(`Downloading model: ${modelName}`);
      
      const res = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          stream: false
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to download model: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`Model ${modelName} download completed`);
      
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error downloading model ${modelName}:`, error);
      return { success: false, error: error.message };
    }
  });
}
