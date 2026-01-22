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

  // Handler para descargar modelos con progreso
  ipcMain.handle('ollama:download-model', async (event, modelName: string) => {
    try {
      console.log(`Downloading model: ${modelName}`);
      
      // Enviar estado inicial
      event.sender.send('ollama:download-progress', {
        modelName,
        status: 'starting',
        progress: 0
      });
      
      const res = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          stream: true // Habilitar streaming para progreso
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to download model: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Variables para manejar múltiples fases de descarga
      let currentPhase = 'downloading';
      let phaseProgress = new Map<string, { completed: number; total: number; weight: number }>();
      let overallProgress = 0;
      let lastReportedProgress = -1;

      // Definir pesos para cada fase de Ollama
      const phaseWeights: { [key: string]: number } = {
        'pulling': 70,        // Descarga principal
        'downloading': 70,    // Descarga principal (alternativo)
        'verifying sha256': 15, // Verificación
        'writing manifest': 5,  // Escritura
        'removing any unused layers': 5, // Limpieza
        'success': 5          // Finalización
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`Model ${modelName} download completed`);
          event.sender.send('ollama:download-progress', {
            modelName,
            status: 'completed',
            progress: 100
          });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            console.log('Ollama progress data:', data);
            
            // Actualizar status si está disponible
            if (data.status) {
              currentPhase = data.status;
              console.log(`Phase updated to: ${currentPhase}`);
            }

            // Manejar progreso por fases
            if (data.total && data.completed !== undefined) {
              // Actualizar progreso de la fase actual
              phaseProgress.set(currentPhase, {
                completed: data.completed,
                total: data.total,
                weight: phaseWeights[currentPhase] || 10
              });

              // Calcular progreso general acumulado
              let totalWeightedProgress = 0;
              let totalWeight = 0;

              for (const [phase, progress] of phaseProgress) {
                const phasePercent = progress.total > 0 ? (progress.completed / progress.total) : 0;
                totalWeightedProgress += phasePercent * progress.weight;
                totalWeight += progress.weight;
              }

              // Calcular progreso general
              overallProgress = totalWeight > 0 ? Math.min(99, Math.round(totalWeightedProgress / totalWeight * 100)) : 0;
              
              // Solo reportar si hay un cambio significativo
              if (Math.abs(overallProgress - lastReportedProgress) >= 1) {
                event.sender.send('ollama:download-progress', {
                  modelName,
                  status: currentPhase,
                  progress: overallProgress,
                  completed: data.completed,
                  total: data.total,
                  phase: currentPhase
                });
                
                lastReportedProgress = overallProgress;
                console.log(`Progress for ${modelName}: ${overallProgress}% - Phase: ${currentPhase} (${data.completed}/${data.total})`);
              }
            } else if (currentPhase === 'success') {
              // Marcar como completado cuando llegue success
              event.sender.send('ollama:download-progress', {
                modelName,
                status: 'completed',
                progress: 100,
                phase: 'completed'
              });
            }
            
          } catch (parseError) {
            // Ignorar líneas que no son JSON válido
            console.log('Failed to parse line:', line);
            continue;
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error(`Error downloading model ${modelName}:`, error);
      
      // Determinar el mensaje de error más apropiado
      let errorMessage = 'Error en la descarga, intente más tarde';
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        errorMessage = 'No se pudo conectar con Ollama. Verifique que esté ejecutándose.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'La descarga tomó demasiado tiempo. Intente nuevamente.';
      } else if (error.message.includes('space') || error.message.includes('disk')) {
        errorMessage = 'Espacio insuficiente en disco para completar la descarga.';
      }
      
      event.sender.send('ollama:download-progress', {
        modelName,
        status: 'error',
        progress: 0,
        error: errorMessage,
        phase: 'Error'
      });
      return { success: false, error: errorMessage };
    }
  });

  // Handler para eliminar modelos
  ipcMain.handle('ollama:delete-model', async (_evt, modelName: string) => {
    try {
      console.log(`Deleting model: ${modelName}`);
      
      const res = await fetch('http://localhost:11434/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete model: ${res.statusText} - ${errorText}`);
      }

      console.log(`Model ${modelName} deleted successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error deleting model ${modelName}:`, error);
      return { success: false, error: error.message };
    }
  });
}
