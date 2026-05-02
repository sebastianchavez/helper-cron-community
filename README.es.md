# HelperCron Community

**HelperCron Community** es una aplicación de escritorio gratuita construida con **Angular 19** y **Electron**. Combina un constructor visual de flujos de automatización sin código con un chat de IA local mediante Ollama, un planificador tipo cron, registros de ejecución y un calendario de flujos — todo ejecutándose localmente sin dependencia obligatoria de la nube.

🌐 [English](README.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [中文](README.zh.md)

---

## Tabla de Contenidos

1. [Características](#características)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Primeros Pasos](#primeros-pasos)
4. [Construcción para Distribución](#construcción-para-distribución)
5. [Páginas de la Aplicación](#páginas-de-la-aplicación)
6. [Referencia de Bloques](#referencia-de-bloques)
7. [Planificador de Flujos](#planificador-de-flujos)
8. [Proveedores de IA](#proveedores-de-ia)
9. [Almacenamiento de Datos](#almacenamiento-de-datos)
10. [Seguridad](#seguridad)
11. [Internacionalización](#internacionalización)
12. [Estructura del Proyecto](#estructura-del-proyecto)

---

## Características

- **Constructor Visual de Flujos** — Lienzo sin código para construir flujos de automatización con bloques reutilizables
- **Planificador Cron** — Programa flujos para ejecutarse a intervalos fijos o en momentos específicos de los días seleccionados; se ejecuta completamente en segundo plano
- **Chat con IA** — Chatea con Ollama localmente con respuestas en streaming en tiempo real
- **Gestión de Conversaciones** — Crea, renombra y elimina conversaciones; organízalas en carpetas con nombre
- **Registros de Ejecución** — Historial de ejecución por flujo con registros paso a paso completos, duración y estado
- **Almacenamiento de Logs Personalizados** — Los flujos pueden escribir logs con nombre clave-valor en SQLite y consultarlos o eliminarlos después
- **Calendario de Flujos** — Calendario de día / mes / año que visualiza flujos programados y sus ejecuciones pasadas
- **Tema Oscuro / Claro / Sistema** — Tres modos de tema con cinco presets de color de acento
- **7 Idiomas en la UI** — Español, Inglés, Alemán, Francés, Portugués, Japonés, Chino

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | Angular 19 (componentes standalone, rutas lazy-loaded) |
| Shell de Escritorio | Electron (contextBridge IPC, `contextIsolation: true`) |
| Estilos | Tailwind CSS 3, `darkMode: 'class'` |
| Base de Datos | SQLite mediante `better-sqlite3` (modo WAL) |
| Lenguaje | TypeScript |
| Alertas | `ngx-simpli-alert` |
| Fuente | Inter (`@fontsource/inter`) |

---

## Primeros Pasos

### Requisitos Previos

- **Node.js** ≥ 18
- **Ollama** *(opcional)* — instala desde [ollama.com](https://ollama.com) para usar modelos de IA locales

### Instalar dependencias

```bash
npm install
```

> `postinstall` reconstruye automáticamente los módulos nativos (`better-sqlite3`) para la versión de Electron instalada.

### Ejecutar en desarrollo

```bash
npm run electron:dev
```

Inicia tres procesos simultáneamente:

1. `ng serve` — servidor de desarrollo Angular en `http://localhost:4200`
2. `tsc --watch` — compilador TypeScript para el proceso principal de Electron
3. `electron` — carga `http://localhost:4200` una vez que el servidor está listo

---

## Construcción para Distribución

Consulta [BUILD.md](BUILD.md) para detalles completos.

```bash
# Windows (instalador NSIS + portable, x64)
npm run dist:win

# macOS (DMG + ZIP, x64 + arm64) — debe ejecutarse en macOS
npm run dist:mac

# Linux (tar.gz, x64)
npm run dist:linux
```

Los artefactos se colocan en el directorio `release/`.

---

## Páginas de la Aplicación

### Dashboard

Punto de entrada al iniciar:

- **Tarjetas de estadísticas** — total de flujos, flujos activos (programados), conversaciones totales, modelos de IA disponibles
- **Ejecuciones recientes** — últimas ejecuciones de flujos con estado (éxito / error)
- **Acciones rápidas** — atajos al Constructor, Chat, Calendario y Modelos de IA

### Constructor de Flujos (Task Builder)

Característica principal. Un **lienzo visual** donde construyes flujos:

1. Arrastra tipos de bloques desde la barra lateral izquierda al lienzo
2. Conecta bloques arrastrando conectores de salida a entrada
3. Configura cada bloque en el panel derecho (clic para seleccionar)
4. Define un **horario** (intervalo o tiempo específico + días de la semana)
5. Haz clic en **Ejecutar** para correr manualmente o guarda para que el planificador lo recoja

Capacidades del lienzo: pan (arrastre con clic central), zoom (rueda del ratón), selección múltiple (Shift+clic), menú contextual con clic derecho, interpolación `{{varName}}` en todos los campos de texto.

### Biblioteca de Flujos (Flow Library)

Navega y gestiona todos los flujos guardados:

- Vista de cuadrícula o lista, búsqueda por nombre, opciones de ordenación
- Filtro solo a flujos programados
- Renombrar, duplicar, eliminar, activar/desactivar flujos
- Ejecución rápida de un flujo directamente desde la biblioteca

### Calendario de Flujos (Flow Calendar)

Visualiza flujos programados e historial de ejecuciones:

- **Vista de día** — cuadrícula por horas con ejecuciones del día
- **Vista de mes** — cuadrícula mensual con puntos de ejecución por día
- **Vista de año** — mapa de calor anual de actividad

Haz clic en cualquier ejecución para abrir el registro completo paso a paso, duración y estado.

### Chat con IA (Chatbot)

Chat completo con Ollama:

- Selector de modelo Ollama local
- Respuestas en streaming token a token
- Gestión de conversaciones (crear, renombrar, eliminar)
- Organización de conversaciones en carpetas con nombre
- Títulos de conversación generados automáticamente tras el primer intercambio

### Modelos de IA

Visualiza y gestiona los modelos Ollama disponibles:

- Lista todos los modelos Ollama disponibles localmente
- Verifica el estado del servicio Ollama
- No se requiere clave API — Ollama se detecta automáticamente en `http://localhost:11434`

### Logs Personalizados

Tabla paginada y buscable de entradas de log escritas por flujos mediante el bloque **Save Log**:

- Filtro por nombre de log, flujo y rango de fechas
- Modal de detalle con visor JSON (raw / tabla)
- Eliminar entradas individuales o eliminación masiva por filtro

### Configuraciones

- **Idioma** — cambia entre 7 idiomas (efecto inmediato)
- **Tema** — Claro, Oscuro o Sistema (sigue la preferencia del SO)
- **Color de acento** — Azul, Verde, Rosa, Ámbar o Violeta
- **Ollama** — verifica el estado del servicio, inicia/detiene el daemon local

---

## Referencia de Bloques

| Bloque | Categoría | Descripción |
|---|---|---|
| `api-rest` | Integración | Solicitud HTTP (GET/POST/PUT/DELETE/PATCH). Enruta a puertos `2xx`, `4xx` o `5xx` según el estado de respuesta. Admite cabeceras, cuerpo, `outputVar` y mapeos de datos. |
| `ai-prompt` | IA | Envía un prompt al modelo Ollama seleccionado; almacena la respuesta de texto en `outputVar`. |
| `local-storage` | Datos | Lee o escribe una clave con nombre en almacenamiento local persistente. |
| `set-variable` | Variables | Asigna un valor literal o expresión a una variable del flujo. |
| `save-log` | Logging | Escribe una entrada de log con nombre (clave + valor) en la tabla de Logs Personalizados. |
| `delete-log` | Logging | Elimina entradas de log que coincidan con un filtro de nombre, opcionalmente del flujo actual. |
| `fork` | Control | Divide la ejecución en múltiples ramas paralelas (fan-out). |
| `join` | Control | Espera a que todas las ramas entrantes completen antes de continuar (fan-in). |

### Interpolación de variables

Cualquier campo de texto admite la sintaxis `{{varName}}`. Las variables se resuelven en tiempo de ejecución desde el contexto del flujo actual.

### Mapeos de datos

Los bloques que producen resultados de objeto (`api-rest`, `ai-prompt`) admiten **mapeos de datos**: extrae una propiedad anidada del resultado y guárdala en una variable para bloques posteriores.

---

## Planificador de Flujos

Se ejecuta en el **proceso principal de Electron** y verifica cada **30 segundos** qué flujos habilitados están programados.

Tipos de programación:

- **Intervalo** — cada N minutos / horas / días desde la última ejecución
- **Hora específica** — a las HH:MM configuradas en los días seleccionados (Lun–Dom)

Cada ejecución:

1. Ejecuta el flujo secuencialmente a través de todos los bloques conectados
2. Persiste un registro de ejecución completo paso a paso en SQLite
3. Muestra una notificación de escritorio del sistema con el resultado

Se previene la ejecución concurrente del mismo flujo.

---

## Proveedores de IA

| Proveedor | Autenticación |
|---|---|
| Ollama (local) | Ninguna — detectado automáticamente en `http://localhost:11434` |

Todas las funciones de IA utilizan Ollama ejecutándose localmente. No se requieren ni almacenan claves API en la nube.

---

## Almacenamiento de Datos

Todos los datos persistentes se almacenan en una única base de datos **SQLite**:

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| Tabla | Contenido |
|---|---|
| `conversation` | Conversaciones de chat con título y carpeta |
| `message` | Mensajes individuales de chat (rol, contenido, timestamps) |
| `folder` | Carpetas de conversaciones |
| `flow` | Flujos de automatización guardados (JSON del lienzo, configuración de horario) |
| `execution_log` | Historial de ejecución por flujo con registros paso a paso y duración |
| `custom_log` | Entradas de log escritas por flujos |
| `user_profile` | Nombre de usuario |

El modo WAL está habilitado para rendimiento de escritura y seguridad ante fallos. Las migraciones de esquema se ejecutan automáticamente al iniciar.

---

## Seguridad

- **Aislamiento de contexto** — `contextIsolation: true`, `nodeIntegration: false`; el renderer se comunica exclusivamente mediante el puente `window.agi` en `preload.ts`
- **Protección de path traversal** — `resolveSafePath()` valida y confina todas las operaciones del sistema de archivos al directorio raíz configurado
- **Lista blanca de comandos** — la ejecución de terminal se limita a `node`, `npm` y `npx ng`; los comandos arbitrarios se rechazan
- **Sin exposición de red** — la aplicación no abre ningún puerto de servidor; todo el IPC es local

---

## Internacionalización

Los archivos de idioma son mapas JSON plano clave-valor en:

```
src/assets/i18n/
  es.json   (Español — predeterminado)
  en.json   (Inglés)
  de.json   (Alemán)
  fr.json   (Francés)
  pt.json   (Portugués)
  ja.json   (Japonés)
  zh.json   (Chino)
```

El idioma activo se almacena en `localStorage` y cambia en tiempo de ejecución sin necesidad de recargar.

---

## Estructura del Proyecto

```
helper-cron-community/
├── electron/                  # Proceso principal de Electron (TypeScript)
│   ├── main.ts                # Punto de entrada, creación de ventana, registro de IPC
│   ├── preload.ts             # contextBridge — expone window.agi al renderer
│   ├── db/                    # Repositorios SQLite (better-sqlite3)
│   ├── executor/
│   │   ├── flow.executor.ts   # Ejecutor de grafos de flujo y bloques
│   │   └── action.executor.ts # Ejecutor de acciones del sistema de archivos
│   ├── ipc/                   # Módulos de manejadores IPC (uno por dominio)
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Planificador cron (tick de 30 s)
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # Componentes de página lazy-loaded
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/  # Lienzo de flujos + barra lateral + paneles de config
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # Componentes UI compartidos
│   │   │   ├── services/      # Servicios Angular
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   └── pipes/         # TranslatePipe, etc.
│   │   └── shared/
│   └── assets/
│       └── i18n/              # Archivos JSON de traducción
├── scripts/                   # Scripts de construcción
├── BUILD.md
└── package.json
```

---

## Pruebas Unitarias

```bash
ng test
```

Ejecuta pruebas unitarias con [Karma](https://karma-runner.github.io) + Jasmine en Chrome Headless.
