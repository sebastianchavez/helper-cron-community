# HelperCron Community

**HelperCron Community** é uma aplicação de desktop gratuita desenvolvida com **Angular 19** e **Electron**. Combina um construtor visual de fluxos de automação sem código com um chat de IA local via Ollama, um agendador tipo cron, registros de execução e um calendário de fluxos — tudo executando localmente sem dependência obrigatória de nuvem.

🌐 [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [中文](README.zh.md)

---

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Stack tecnológico](#stack-tecnológico)
3. [Primeiros passos](#primeiros-passos)
4. [Build para distribuição](#build-para-distribuição)
5. [Páginas da aplicação](#páginas-da-aplicação)
6. [Referência de tipos de bloco](#referência-de-tipos-de-bloco)
7. [Agendador de fluxos](#agendador-de-fluxos)
8. [Provedores de IA](#provedores-de-ia)
9. [Armazenamento de dados](#armazenamento-de-dados)
10. [Segurança](#segurança)
11. [Internacionalização](#internacionalização)
12. [Estrutura do projeto](#estrutura-do-projeto)

---

## Funcionalidades

- **Construtor visual de fluxos** — Canvas sem código para criar fluxos de automação com blocos reutilizáveis
- **Agendador Cron** — Agende fluxos para executar em intervalos fixos ou em horários específicos nos dias selecionados; executa completamente em segundo plano
- **Chat de IA** — Converse localmente com Ollama com respostas em streaming em tempo real
- **Gerenciamento de conversas** — Criar, renomear e excluir conversas; organizá-las em pastas nomeadas
- **Registros de execução** — Histórico de execução por fluxo com registros completos passo a passo, duração e status
- **Armazenamento de logs personalizados** — Fluxos podem gravar logs nomeados chave-valor no SQLite e consultá-los ou excluí-los posteriormente
- **Calendário de fluxos** — Calendário dia/mês/ano visualizando fluxos agendados e suas execuções passadas
- **Tema escuro/claro/sistema** — Três modos de tema com cinco predefinições de cor de destaque
- **7 idiomas da interface** — Espanhol, Inglês, Alemão, Francês, Português, Japonês, Chinês

---

## Stack tecnológico

| Camada | Tecnologia |
|---|---|
| Framework UI | Angular 19 (componentes standalone, rotas lazy-loaded) |
| Shell desktop | Electron (contextBridge IPC, `contextIsolation: true`) |
| Estilização | Tailwind CSS 3, `darkMode: 'class'` |
| Banco de dados | SQLite via `better-sqlite3` (modo WAL) |
| Linguagem | TypeScript |
| Alertas | `ngx-simpli-alert` |
| Fonte | Inter (`@fontsource/inter`) |

---

## Primeiros passos

### Pré-requisitos

- **Node.js** ≥ 18
- **Ollama** *(opcional)* — instalar em [ollama.com](https://ollama.com) para usar modelos de IA locais

### Instalar dependências

```bash
npm install
```

> `postinstall` recompila automaticamente os módulos nativos (`better-sqlite3`) para a versão do Electron instalada.

### Executar em desenvolvimento

```bash
npm run electron:dev
```

Inicia três processos simultaneamente:

1. `ng serve` — servidor de desenvolvimento Angular em `http://localhost:4200`
2. `tsc --watch` — compilador TypeScript para o processo principal do Electron
3. `electron` — carrega `http://localhost:4200` quando o servidor estiver pronto

---

## Build para distribuição

Consulte [BUILD.md](BUILD.md) para detalhes completos.

```bash
# Windows (instalador NSIS + portátil, x64)
npm run dist:win

# macOS (DMG + ZIP, x64 + arm64) — deve ser executado no macOS
npm run dist:mac

# Linux (tar.gz, x64)
npm run dist:linux
```

Os artefatos de build são colocados no diretório `release/`.

---

## Páginas da aplicação

### Dashboard

Ponto de entrada ao iniciar:

- **Cartões de estatísticas** — total de fluxos, fluxos ativos (agendados), total de conversas, modelos de IA disponíveis
- **Execuções recentes** — últimas execuções de fluxos com status (sucesso / erro)
- **Ações rápidas** — atalhos para o Construtor, Chat, Calendário e Modelos de IA

### Construtor de tarefas (Task Builder)

Funcionalidade principal. Um **canvas visual** para construir fluxos:

1. Arrastar tipos de blocos da barra lateral esquerda para o canvas
2. Conectar blocos arrastando conectores de saída para entrada
3. Configurar cada bloco no painel direito (clicar para selecionar)
4. Definir um **agendamento** (intervalo ou horário específico + dias da semana)
5. Clicar em **Executar** para executar manualmente ou salvar para o agendador processar

Capacidades do canvas: panorâmica (arrastar botão do meio), zoom (roda do mouse), seleção múltipla (Shift+clique), menu de contexto com botão direito, interpolação `{{varName}}` em todos os campos de texto.

### Biblioteca de fluxos

Navegar e gerenciar todos os fluxos salvos:

- Visualização em grade ou lista, pesquisa por nome, opções de ordenação
- Filtrar apenas fluxos agendados
- Renomear, duplicar, excluir, ativar/desativar fluxos
- Execução rápida de um fluxo diretamente da biblioteca

### Calendário de fluxos

Visualizar fluxos agendados e histórico de execuções:

- **Visualização de dia** — grade horária com execuções do dia
- **Visualização de mês** — grade mensal com pontos de execução por dia
- **Visualização de ano** — mapa de calor anual de atividade

Clicar em qualquer execução para abrir o registro completo passo a passo.

### Chat de IA (Chatbot)

Chat completo com Ollama:

- Seletor de modelo Ollama local
- Respostas em streaming token por token
- Gerenciamento de conversas (criar, renomear, excluir)
- Organização de conversas em pastas nomeadas
- Títulos de conversa gerados automaticamente após a primeira troca

### Modelos de IA

Visualizar e gerenciar os modelos Ollama disponíveis:

- Lista todos os modelos Ollama disponíveis localmente
- Verificar o status do serviço Ollama
- Nenhuma chave de API necessária — Ollama é detectado automaticamente em `http://localhost:11434`

### Logs personalizados

Tabela paginada e pesquisável de entradas de log escritas por fluxos via bloco **Save Log**:

- Filtro por nome do log, fluxo e intervalo de datas
- Modal de detalhes com visualizador JSON bruto/tabela
- Excluir entradas individuais ou exclusão em massa por filtro

### Configurações

- **Idioma** — alternar entre 7 idiomas (efeito imediato)
- **Tema** — Claro, Escuro ou Sistema (segue a preferência do SO)
- **Cor de destaque** — Azul, Verde, Rosa, Âmbar ou Violeta
- **Ollama** — verificar status do serviço, iniciar/parar o daemon local

---

## Referência de tipos de bloco

| Bloco | Categoria | Descrição |
|---|---|---|
| `api-rest` | Integração | Requisição HTTP (GET/POST/PUT/DELETE/PATCH). Roteia para portas `2xx`, `4xx` ou `5xx` com base no status de resposta. Suporta cabeçalhos, body, `outputVar` e mapeamentos de dados. |
| `ai-prompt` | IA | Envia um prompt para o modelo Ollama selecionado; armazena a resposta de texto em `outputVar`. |
| `local-storage` | Dados | Ler ou escrever uma chave nomeada no armazenamento local persistente. |
| `set-variable` | Variáveis | Atribui um valor literal ou expressão a uma variável de fluxo nomeada. |
| `save-log` | Logging | Escreve uma entrada de log nomeada (chave + valor) na tabela de logs personalizados. |
| `delete-log` | Logging | Exclui entradas de log que correspondem a um filtro de nome, opcionalmente com escopo para o fluxo atual. |
| `fork` | Controle | Divide a execução em múltiplos ramos paralelos (fan-out). |
| `join` | Controle | Aguarda todos os ramos de entrada serem concluídos antes de continuar (fan-in). |

### Interpolação de variáveis

Qualquer campo de texto suporta a sintaxe `{{varName}}`. Variáveis são resolvidas em tempo de execução a partir do contexto do fluxo atual.

### Mapeamentos de dados

Blocos que produzem resultados de objeto (`api-rest`, `ai-prompt`) suportam **mapeamentos de dados**: extrair uma propriedade aninhada do resultado e armazená-la em uma variável nomeada para blocos posteriores.

---

## Agendador de fluxos

Executa no **processo principal do Electron** e verifica a cada **30 segundos** quais fluxos habilitados estão agendados.

Tipos de agendamento:

- **Intervalo** — a cada N minutos / horas / dias desde a última execução
- **Horário específico** — no HH:MM configurado nos dias selecionados (Seg–Dom)

Cada execução:

1. Executa o fluxo sequencialmente através de todos os blocos conectados
2. Persiste um registro de execução completo passo a passo no SQLite
3. Exibe uma notificação desktop do sistema operacional com o resultado

A execução simultânea do mesmo fluxo é impedida.

---

## Provedores de IA

| Provedor | Autenticação |
|---|---|
| Ollama (local) | Nenhuma — detectado automaticamente em `http://localhost:11434` |

Todas as funções de IA utilizam o Ollama executando localmente. Nenhuma chave de API de nuvem é necessária ou armazenada.

---

## Armazenamento de dados

Todos os dados persistentes são armazenados em um único banco de dados **SQLite**:

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| Tabela | Conteúdo |
|---|---|
| `conversation` | Conversas de chat com título e pasta |
| `message` | Mensagens de chat individuais (papel, conteúdo, timestamps) |
| `folder` | Pastas de conversas |
| `flow` | Fluxos de automação salvos (JSON do canvas, configuração de agendamento) |
| `execution_log` | Histórico de execução por fluxo com registros passo a passo e duração |
| `custom_log` | Entradas de log nomeadas escritas por fluxos |
| `user_profile` | Nome de usuário |

O modo WAL está habilitado para performance de escrita e segurança contra falhas. Migrações de esquema executam automaticamente na inicialização.

---

## Segurança

- **Isolamento de contexto** — `contextIsolation: true`, `nodeIntegration: false`; o renderer se comunica exclusivamente via ponte `window.agi` em `preload.ts`
- **Proteção contra path traversal** — `resolveSafePath()` valida e confina todas as operações do sistema de arquivos ao diretório raiz configurado
- **Lista branca de comandos** — execução de terminal limitada a `node`, `npm` e `npx ng`; comandos arbitrários são rejeitados
- **Sem exposição de rede** — a aplicação não abre nenhuma porta de servidor; todo o IPC é local

---

## Internacionalização

Arquivos de idioma são mapas JSON chave-valor simples em:

```
src/assets/i18n/
  es.json   (Espanhol — padrão)
  en.json   (Inglês)
  de.json   (Alemão)
  fr.json   (Francês)
  pt.json   (Português)
  ja.json   (Japonês)
  zh.json   (Chinês)
```

O idioma ativo é armazenado em `localStorage` e alterado em tempo de execução sem recarga.

---

## Estrutura do projeto

```
helper-cron-community/
├── electron/                  # Processo principal Electron (TypeScript)
│   ├── main.ts                # Ponto de entrada, criação de janela, registro IPC
│   ├── preload.ts             # contextBridge — expõe window.agi ao renderer
│   ├── db/                    # Repositórios SQLite (better-sqlite3)
│   ├── executor/
│   │   ├── flow.executor.ts   # Percorredor de grafo de fluxo e executor de blocos
│   │   └── action.executor.ts # Executor de ações do sistema de arquivos
│   ├── ipc/                   # Módulos de handlers IPC (um por domínio de funcionalidade)
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Agendador cron (tick de 30 s)
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # Componentes de página lazy-loaded
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # Componentes UI compartilhados
│   │   │   ├── services/      # Serviços Angular
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   └── pipes/         # TranslatePipe, etc.
│   │   └── shared/
│   └── assets/
│       └── i18n/              # Arquivos JSON de tradução
├── scripts/                   # Scripts auxiliares de build
├── BUILD.md
└── package.json
```

---

## Executar testes

```bash
ng test
```

Executa testes unitários com [Karma](https://karma-runner.github.io) + Jasmine no Chrome Headless.
