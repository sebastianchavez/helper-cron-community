# HelperCron Community

**HelperCron Community** ist eine kostenlose Desktop-Anwendung, entwickelt mit **Angular 19** und **Electron**. Sie kombiniert einen visuellen No-Code-Flow-Automation-Builder mit einem lokalen KI-Chat über Ollama, einem Cron-ähnlichen Scheduler, Ausführungsprotokollen und einem Flow-Kalender — alles läuft lokal ohne obligatorische Cloud-Abhängigkeit.

🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [中文](README.zh.md)

---

## Inhaltsverzeichnis

1. [Funktionen](#funktionen)
2. [Tech-Stack](#tech-stack)
3. [Erste Schritte](#erste-schritte)
4. [Build für die Verteilung](#build-für-die-verteilung)
5. [Anwendungsseiten](#anwendungsseiten)
6. [Block-Typen-Referenz](#block-typen-referenz)
7. [Flow-Scheduler](#flow-scheduler)
8. [KI-Anbieter](#ki-anbieter)
9. [Datenspeicherung](#datenspeicherung)
10. [Sicherheit](#sicherheit)
11. [Internationalisierung](#internationalisierung)
12. [Projektstruktur](#projektstruktur)

---

## Funktionen

- **Visueller Flow-Builder** — No-Code-Canvas zum Erstellen von Automatisierungs-Workflows aus wiederverwendbaren Blöcken
- **Cron-Scheduler** — Plant Flows für feste Intervalle oder bestimmte Zeiten an ausgewählten Wochentagen; läuft vollständig im Hintergrund
- **KI-Chat** — Chatte lokal mit Ollama mit Echtzeit-Streaming-Antworten
- **Konversationsverwaltung** — Konversationen erstellen, umbenennen und löschen; in benannten Ordnern organisieren
- **Ausführungsprotokolle** — Flow-Ausführungsverlauf mit vollständigen Schritt-für-Schritt-Protokollen, Dauer und Status
- **Benutzerdefinierter Log-Speicher** — Flows können benannte Schlüssel-Wert-Logs in SQLite schreiben und diese später abfragen oder löschen
- **Flow-Kalender** — Tag-/Monat-/Jahreskalender zur Visualisierung geplanter Flows und ihrer vergangenen Ausführungen
- **Dunkel-/Hell-/Systemthema** — Drei Themenmodi mit fünf Akzentfarben-Voreinstellungen
- **7 UI-Sprachen** — Spanisch, Englisch, Deutsch, Französisch, Portugiesisch, Japanisch, Chinesisch

---

## Tech-Stack

| Ebene | Technologie |
|---|---|
| UI-Framework | Angular 19 (Standalone-Komponenten, Lazy-Loaded-Routen) |
| Desktop-Shell | Electron (contextBridge IPC, `contextIsolation: true`) |
| Styling | Tailwind CSS 3, `darkMode: 'class'` |
| Datenbank | SQLite via `better-sqlite3` (WAL-Modus) |
| Sprache | TypeScript |
| Benachrichtigungen | `ngx-simpli-alert` |
| Schriftart | Inter (`@fontsource/inter`) |

---

## Erste Schritte

### Voraussetzungen

- **Node.js** ≥ 18
- **Ollama** *(optional)* — von [ollama.com](https://ollama.com) installieren für lokale KI-Modelle

### Abhängigkeiten installieren

```bash
npm install
```

> `postinstall` rebuild native Module (`better-sqlite3`) automatisch für die installierte Electron-Version.

### Im Entwicklungsmodus starten

```bash
npm run electron:dev
```

Startet drei Prozesse gleichzeitig:

1. `ng serve` — Angular-Dev-Server auf `http://localhost:4200`
2. `tsc --watch` — TypeScript-Compiler für den Electron-Hauptprozess
3. `electron` — lädt `http://localhost:4200`, sobald der Dev-Server bereit ist

---

## Build für die Verteilung

Vollständige Details in [BUILD.md](BUILD.md).

```bash
# Windows (NSIS-Installer + Portable, x64)
npm run dist:win

# macOS (DMG + ZIP, x64 + arm64) — muss auf macOS ausgeführt werden
npm run dist:mac

# Linux (tar.gz, x64)
npm run dist:linux
```

Build-Artefakte befinden sich im Verzeichnis `release/`.

---

## Anwendungsseiten

### Dashboard

Einstiegspunkt nach dem Start:

- **Statistikkarten** — Gesamtanzahl Flows, aktive (geplante) Flows, Gesamtkonversationen, verfügbare KI-Modelle
- **Letzte Ausführungen** — die letzten Flow-Läufe mit Status (Erfolg / Fehler)
- **Schnellaktionen** — Verknüpfungen zu Task-Builder, Chat, Kalender und KI-Modellen

### Task-Builder (Flow-Automation)

Kernfunktion. Ein **visuelles Canvas** zum Erstellen von Flows:

1. Block-Typen von der linken Seitenleiste auf das Canvas ziehen
2. Blöcke durch Ziehen von Ausgangs- zu Eingangsverbindern verbinden
3. Jeden Block im rechten Panel konfigurieren (zum Auswählen klicken)
4. Einen **Zeitplan** festlegen (Intervall oder bestimmte Zeit + Wochentage)
5. **Ausführen** klicken für manuelle Ausführung oder speichern, damit der Scheduler es aufnimmt

Canvas-Fähigkeiten: Schwenken (mittlere Maustaste), Zoom (Mausrad), Mehrfachauswahl (Shift+Klick), Rechtsklick-Kontextmenü, `{{varName}}`-Interpolation in allen Textfeldern.

### Flow-Bibliothek

Alle gespeicherten Flows durchsuchen und verwalten:

- Raster- oder Listenansicht, Suche nach Name, Sortieroptionen
- Filter für nur geplante Flows
- Flows umbenennen, duplizieren, löschen, aktivieren/deaktivieren
- Flow direkt aus der Bibliothek schnell ausführen

### Flow-Kalender

Geplante Flows und Ausführungsverlauf visualisieren:

- **Tagesansicht** — stündliches Raster mit Ausführungen des Tages
- **Monatsansicht** — monatliches Raster mit Ausführungspunkten pro Tag
- **Jahresansicht** — jährliche Aktivitäts-Heatmap

Auf eine Ausführung klicken, um das vollständige Schritt-für-Schritt-Protokoll zu öffnen.

### KI-Chat (Chatbot)

Vollwertiger Chat mit Ollama:

- Ollama-Modellauswahl (lokal)
- Streaming-Antworten Token für Token
- Konversationsverwaltung (erstellen, umbenennen, löschen)
- Ordnerorganisation für Konversationen
- Automatisch generierte Konversationstitel nach dem ersten Austausch

### KI-Modelle

VeRügbare Ollama-Modelle anzeigen und verwalten:

- Listet alle lokal verfügbaren Ollama-Modelle auf
- Dienststatus von Ollama prüfen
- Kein API-Key erforderlich — Ollama wird automatisch unter `http://localhost:11434` erkannt

### Benutzerdefinierte Logs

Durchsuchbare, paginierte Tabelle der von Flows geschriebenen Log-Einträge via **Save Log**-Block:

- Filter nach Log-Name, Flow und Datumsbereich
- Detailmodal mit Raw-/Tabellen-JSON-Viewer
- Einzelne Einträge oder Massenbenachrichtigung löschen

### Einstellungen

- **Sprache** — zwischen 7 Sprachen wechseln (sofortige Wirkung)
- **Thema** — Hell, Dunkel oder System (folgt OS-Präferenz)
- **Akzentfarbe** — Blau, Grün, Pink, Bernstein oder Violett
- **Ollama** — Dienststatus prüfen, lokalen Daemon starten/stoppen

---

## Block-Typen-Referenz

| Block | Kategorie | Beschreibung |
|---|---|---|
| `api-rest` | Integration | HTTP-Anfrage (GET/POST/PUT/DELETE/PATCH). Leitet zu `2xx`-, `4xx`- oder `5xx`-Ports je nach Antwortstatus. Unterstützt Header, Body, `outputVar` und Datenzuordnungen. |
| `ai-prompt` | KI | Sendet einen Prompt an das ausgewählte Ollama-Modell; speichert die Textantwort in `outputVar`. |
| `local-storage` | Daten | Liest oder schreibt einen benannten Schlüssel im persistenten lokalen Speicher. |
| `set-variable` | Variablen | Weist einem Flow-Variablennamen einen Literalwert oder Ausdruck zu. |
| `save-log` | Logging | Schreibt einen benannten Log-Eintrag (Schlüssel + Wert) in die Tabelle für benutzerdefinierte Logs. |
| `delete-log` | Logging | Löscht Log-Einträge, die einem Namensfilter entsprechen, optional auf den aktuellen Flow beschränkt. |
| `fork` | Steuerung | Teilt die Ausführung in mehrere parallele Zweige (Fan-out). |
| `join` | Steuerung | Wartet, bis alle eingehenden Zweige abgeschlossen sind, bevor fortgefahren wird (Fan-in). |

### Variableninterpolation

Jedes Textfeld unterstützt die `{{varName}}`-Syntax. Variablen werden zur Laufzeit aus dem aktuellen Flow-Kontext aufgelöst.

### Datenzuordnungen

Blöcke, die Objektergebnisse erzeugen (`api-rest`, `ai-prompt`), unterstützen **Datenzuordnungen**: eine verschachtelte Eigenschaft aus dem Ergebnis extrahieren und in einer benannten Variable für nachgelagerte Blöcke speichern.

---

## Flow-Scheduler

Läuft im **Electron-Hauptprozess** und prüft alle **30 Sekunden**, welche aktivierten Flows fällig sind.

Zeitplantypen:

- **Intervall** — alle N Minuten / Stunden / Tage seit der letzten Ausführung
- **Bestimmte Zeit** — zur konfigurierten HH:MM an ausgewählten Wochentagen (Mo–So)

Jede Ausführung:

1. Führt den Flow sequenziell durch alle verbundenen Blöcke aus
2. Speichert ein vollständiges Schritt-für-Schritt-Ausführungsprotokoll in SQLite
3. Zeigt eine Desktop-Benachrichtigung des Betriebssystems mit dem Ergebnis

Gleichzeitige Ausführung desselben Flows wird verhindert.

---

## KI-Anbieter

| Anbieter | Authentifizierung |
|---|---|
| Ollama (lokal) | Keine — automatisch erkannt unter `http://localhost:11434` |

Alle KI-Funktionen verwenden Ollama, das lokal läuft. Es sind keine Cloud-API-Keys erforderlich oder gespeichert.

---

## Datenspeicherung

Alle persistenten Daten werden in einer einzigen **SQLite**-Datenbank gespeichert:

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| Tabelle | Inhalt |
|---|---|
| `conversation` | Chat-Konversationen mit Titel und Ordner |
| `message` | Einzelne Chat-Nachrichten (Rolle, Inhalt, Zeitstempel) |
| `folder` | Konversationsordner |
| `flow` | Gespeicherte Automatisierungs-Flows (Canvas-JSON, Zeitplankonfiguration) |
| `execution_log` | Flow-Ausführungsverlauf mit Schritt-Protokollen und Dauer |
| `custom_log` | Von Flows geschriebene benannte Schlüssel-Wert-Log-Einträge |
| `user_profile` | Benutzername |

Der WAL-Modus ist für Schreibleistung und Absturzsicherheit aktiviert. Schema-Migrationen laufen automatisch beim Start.

---

## Sicherheit

- **Kontextisolierung** — `contextIsolation: true`, `nodeIntegration: false`; der Renderer kommuniziert ausschließlich über die `window.agi`-Brücke in `preload.ts`
- **Pfaddurchlaufschutz** — `resolveSafePath()` validiert und beschränkt alle Dateisystemoperationen auf das konfigurierte Projektstammverzeichnis
- **Befehls-Whitelist** — Terminal-Ausführung auf `node`, `npm` und `npx ng` beschränkt; beliebige Befehle werden abgelehnt
- **Keine Netzwerkexposition** — die Anwendung öffnet keinen Server-Port; alle IPC sind lokal

---

## Internationalisierung

Sprachdateien sind flache JSON-Schlüssel-Wert-Karten unter:

```
src/assets/i18n/
  es.json   (Spanisch — Standard)
  en.json   (Englisch)
  de.json   (Deutsch)
  fr.json   (Französisch)
  pt.json   (Portugiesisch)
  ja.json   (Japanisch)
  zh.json   (Chinesisch)
```

Die aktive Sprache wird in `localStorage` gespeichert und zur Laufzeit ohne Neuladen geändert.

---

## Projektstruktur

```
helper-cron-community/
├── electron/                  # Electron-Hauptprozess (TypeScript)
│   ├── main.ts                # Einstiegspunkt, Fenstererstellung, IPC-Registrierung
│   ├── preload.ts             # contextBridge — stellt window.agi dem Renderer bereit
│   ├── db/                    # SQLite-Repositories (better-sqlite3)
│   ├── executor/
│   │   ├── flow.executor.ts   # Flow-Graph-Walker und Block-Executor
│   │   └── action.executor.ts # Dateisystem-Aktions-Executor
│   ├── ipc/                   # IPC-Handler-Module (einer pro Feature-Domäne)
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Cron-Scheduler (30 s Tick)
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # Lazy-geladene Seitenkomponenten
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # Gemeinsame UI-Komponenten
│   │   │   ├── services/      # Angular-Services
│   │   │   ├── models/        # TypeScript-Interfaces
│   │   │   └── pipes/         # TranslatePipe, etc.
│   │   └── shared/
│   └── assets/
│       └── i18n/              # Übersetzungs-JSON-Dateien
├── scripts/                   # Build-Hilfsskripte
├── BUILD.md
└── package.json
```

---

## Tests ausführen

```bash
ng test
```

Führt Unit-Tests mit [Karma](https://karma-runner.github.io) + Jasmine in Chrome Headless aus.
