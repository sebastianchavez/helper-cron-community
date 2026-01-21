import { ipcMain } from 'electron';

const SYSTEM_PLAN_PROMPT = `
Eres un asistente de programación.
Devuelve SOLO un objeto JSON válido (sin texto extra, sin markdown, sin \`\`\`).
Formato EXACTO:
{
  "goal": "string",
  "actions": [
    {
      "id": "string",
      "verb": "create|update|delete|read",
      "title": "string",
      "type": "write_file|read_file|delete_file|run_command",
      "path": "string (opcional)",
      "content": "string (opcional)",
      "command": "string (opcional)",
      "args": ["string"] (opcional)
    }
  ]
}
Reglas:
- Si type es "write_file": incluye path y content.
- Si type es "read_file" o "delete_file": incluye path.
- Si type es "run_command": incluye command y opcional args.
- Usa rutas RELATIVAS, nunca absolutas.
`;

function safeJsonParse(text: string) {
  // Intenta extraer JSON aunque el modelo se “escape” con texto extra.
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('La respuesta no contiene un JSON válido.');
  }
  const jsonText = text.slice(first, last + 1);
  return JSON.parse(jsonText);
}

export function registerOllamaPlanHandler() {
  ipcMain.handle(
    'ollama:plan',
    async (_evt, payload: { model: string; userMessage: string }) => {
      try {
         const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: payload.model,
          stream: false,
          messages: [
            { role: 'system', content: SYSTEM_PLAN_PROMPT },
            { role: 'user', content: payload.userMessage },
          ],
        }),
      });

      console.log('ollama plan body', JSON.stringify({
        model: payload.model,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PLAN_PROMPT },
          { role: 'user', content: payload.userMessage },
        ],
      }));


      if (!res.ok) {
        return { ok: false, error: `Ollama HTTP ${res.status}` };
      }

      const data = await res.json();
      const content = data?.message?.content ?? '';

      try {
        const parsed = safeJsonParse(content);

        // Validación mínima (sin Zod por ahora)
        if (!parsed?.goal || !Array.isArray(parsed?.actions)) {
          return { ok: false, error: 'JSON no cumple el formato esperado.' };
        }

        return { ok: true, plan: parsed };
      } catch (e: any) {
        return { ok: false, error: e.message || 'No se pudo parsear JSON.' };
      }
      } catch (error: any) {
        console.log('Error: ', error);
        
      }
    },
  );
}
