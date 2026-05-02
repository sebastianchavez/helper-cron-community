# HelperCron Community

**HelperCron Community** is a free desktop application built with **Angular 19** and **Electron**. It combines a visual no-code flow automation builder with a local AI chat powered by Ollama, a cron-like scheduler, execution logs, and a flow calendar — all running locally without any mandatory cloud dependency.

🌐 [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [中文](README.zh.md)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Building for Distribution](#building-for-distribution)
5. [Application Pages](#application-pages)
6. [Block Types Reference](#block-types-reference)
7. [Flow Scheduler](#flow-scheduler)
8. [AI Providers](#ai-providers)
9. [Data Storage](#data-storage)
10. [Security](#security)
11. [Internationalization](#internationalization)
12. [Project Structure](#project-structure)

---

## Features

- **Visual Flow Builder** — No-code canvas to build automation workflows from reusable blocks
- **Cron Scheduler** — Schedule flows to run at fixed intervals or at specific times on selected weekdays; runs entirely in the background
- **AI Chat** — Chat with Ollama locally with real-time streaming responses
- **Conversation Management** — Create, rename, and delete conversations; organize them in named folders
- **Execution Logs** — Per-flow execution history with full step-by-step logs, duration, and status
- **Custom Log Storage** — Flows can write named key-value logs to SQLite and query or delete them later
- **Flow Calendar** — Day / month / year calendar visualizing scheduled flows and their past executions
- **Dark / Light / System Theme** — Three theme modes with five accent color presets
- **7 UI Languages** — Spanish, English, German, French, Portuguese, Japanese, Chinese

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | Angular 19 (standalone components, lazy-loaded routes) |
| Desktop Shell | Electron (contextBridge IPC, `contextIsolation: true`) |
| Styling | Tailwind CSS 3, `darkMode: 'class'` |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| Language | TypeScript |
| Alerts | `ngx-simpli-alert` |
| Font | Inter (`@fontsource/inter`) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Ollama** *(optional)* — install from [ollama.com](https://ollama.com) to use local AI models

### Install dependencies

```bash
npm install
```

> `postinstall` automatically rebuilds native modules (`better-sqlite3`) for the installed Electron version.

### Run in development

```bash
npm run electron:dev
```

This starts three processes concurrently:

1. `ng serve` — Angular dev server on `http://localhost:4200`
2. `tsc --watch` — TypeScript compiler for the Electron main process
3. `electron` — loads `http://localhost:4200` once the dev server is ready

---

## Building for Distribution

See [BUILD.md](BUILD.md) for full details.

```bash
# Windows (NSIS installer + portable, x64)
npm run dist:win

# macOS (DMG + ZIP, x64 + arm64) — must run on macOS
npm run dist:mac

# Linux (tar.gz, x64)
npm run dist:linux
```

Build artifacts are placed in the `release/` directory.

---

## Application Pages

### Dashboard

Entry point after startup:

- **Stats cards** — total flows, active (scheduled) flows, total conversations, available AI models
- **Recent executions** — last flow runs with status (success / error)
- **Quick actions** — shortcuts to Task Builder, Chat, Calendar, and AI Models

### Task Builder (Flow Automation)

The core feature. A **visual canvas** where you build flows by:

1. Dragging block types from the left sidebar onto the canvas
2. Connecting blocks by dragging output connectors to input connectors
3. Configuring each block in the right panel (click to select)
4. Setting a **schedule** (interval or specific time + weekdays)
5. Clicking **Run** to execute manually, or saving so the scheduler picks it up

Canvas capabilities: pan (middle-click drag), zoom (scroll wheel), multi-select (Shift+click), right-click context menu, `{{varName}}` interpolation in all string config fields.

### Flow Library

Browse and manage all saved flows:

- Grid or list view, search by name, sort by most recent or name
- Filter to scheduled-only flows
- Rename, duplicate, delete, enable/disable flows
- Quick-run a flow directly from the library

### Flow Calendar

Visualize scheduled flows and their execution history:

- **Day view** — hourly grid showing executions for one day
- **Month view** — monthly grid with execution dots per day
- **Year view** — annual heatmap of execution activity

Click any execution to open a detail panel with the full step-by-step log, duration, and status.

### AI Chat (Chatbot)

Full-featured chat with Ollama:

- Ollama local model selector
- Streaming token-by-token responses
- Conversation management (create, rename, delete)
- Folder organization for conversations
- Auto-generated conversation titles after the first exchange

### AI Models

View and manage available Ollama models:

- Lists all locally available Ollama models
- Check the Ollama service status
- No API key required — Ollama is auto-detected at `http://localhost:11434`

### Custom Logs

Searchable, paginated table of log entries written by flows using the **Save Log** block:

- Filter by log name, flow, and date range
- Detail modal with raw / table JSON viewer
- Delete individual entries or bulk-delete by filter

### Settings

- **Language** — switch between 7 languages (takes effect immediately)
- **Theme** — Light, Dark, or System (follows OS preference)
- **Accent color** — Blue, Green, Pink, Amber, or Violet
- **Ollama** — check service status, start/stop the local Ollama daemon

---

## Block Types Reference

| Block | Category | Description |
|---|---|---|
| `api-rest` | Integration | HTTP request (GET/POST/PUT/DELETE/PATCH). Routes to `2xx`, `4xx`, or `5xx` output ports based on response status. Supports headers, body, `outputVar`, and data mappings. |
| `ai-prompt` | AI | Sends a prompt to the selected Ollama model; stores the text response in `outputVar`. |
| `local-storage` | Data | Read or write a named key in persistent local storage. |
| `set-variable` | Variables | Assigns a literal value or expression to a named flow variable. |
| `save-log` | Logging | Writes a named log entry (key + value) to the Custom Logs table. |
| `delete-log` | Logging | Deletes log entries matching a name filter, optionally scoped to the current flow. |
| `fork` | Control | Splits execution into multiple parallel branches (fan-out). |
| `join` | Control | Waits for all incoming branches to complete before continuing (fan-in). |

### Variable interpolation

Any string config field supports `{{varName}}` syntax. Variables are resolved at runtime from the current flow context.

### Data mappings

Blocks that produce object results (`api-rest`, `ai-prompt`) support **data mappings**: extract a nested property path from the result and store it in a named variable for downstream blocks.

---

## Flow Scheduler

The scheduler runs in the **Electron main process** and checks every **30 seconds** which enabled flows are due.

Schedule types:

- **Interval** — every N minutes / hours / days since the last execution
- **Specific time** — at a configured HH:MM on selected weekdays (Mon–Sun)

Each execution:

1. Runs the flow sequentially through all connected blocks
2. Persists a full step-by-step execution log to SQLite
3. Shows an OS desktop notification with the result

Concurrent execution of the same flow is prevented.

---

## AI Providers

| Provider | Auth |
|---|---|
| Ollama (local) | None — auto-detected at `http://localhost:11434` |

All AI features use Ollama running locally. No cloud API keys are required or stored.

---

## Data Storage

All persistent data is stored in a single **SQLite** database:

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| Table | Contents |
|---|---|
| `conversation` | Chat conversations with title and folder |
| `message` | Individual chat messages (role, content, timestamps) |
| `folder` | Conversation folders |
| `flow` | Saved automation flows (canvas JSON, schedule config) |
| `execution_log` | Per-flow execution history with step logs and duration |
| `custom_log` | Named key-value log entries written by flows |
| `user_profile` | User display name |

WAL mode is enabled for write performance and crash safety. Schema migrations run automatically on startup.

---

## Security

- **Context isolation** — `contextIsolation: true`, `nodeIntegration: false`; the renderer communicates with the main process exclusively via the `window.agi` bridge in `preload.ts`
- **Path traversal protection** — `resolveSafePath()` validates and confines all file-system operations to the configured project root
- **Command whitelist** — terminal execution is limited to `node`, `npm`, and `npx ng`; arbitrary commands are rejected
- **No network exposure** — the application opens no server port; all IPC is local

---

## Internationalization

Language files are flat JSON key-value maps at:

```
src/assets/i18n/
  es.json   (Spanish — default)
  en.json   (English)
  de.json   (German)
  fr.json   (French)
  pt.json   (Portuguese)
  ja.json   (Japanese)
  zh.json   (Chinese)
```

The active language is stored in `localStorage` and changed at runtime without a reload.

---

## Project Structure

```
helper-cron-community/
├── electron/                  # Electron main process (TypeScript)
│   ├── main.ts                # Entry point, window creation, IPC registration
│   ├── preload.ts             # contextBridge — exposes window.agi to renderer
│   ├── db/                    # SQLite repositories (better-sqlite3)
│   ├── executor/
│   │   ├── flow.executor.ts   # Flow graph walker and block executor
│   │   └── action.executor.ts # File-system action executor
│   ├── ipc/                   # IPC handler modules (one per feature domain)
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Cron scheduler (30 s tick)
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # Lazy-loaded page components
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/  # Flow canvas + block sidebar + config panels
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # Shared UI components
│   │   │   ├── services/      # Angular services
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── pipes/         # TranslatePipe, etc.
│   │   └── shared/
│   └── assets/
│       └── i18n/              # Translation JSON files
├── scripts/                   # Build helper scripts
├── BUILD.md
└── package.json
```

---

## Running tests

```bash
ng test
```

Runs unit tests with [Karma](https://karma-runner.github.io) + Jasmine in Chrome Headless.
