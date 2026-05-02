# HelperCron Community

**HelperCron Community** 是一款使用 **Angular 19** 和 **Electron** 构建的免费桌面应用程序，结合了可视化无代码流程自动化构建器（使用可复用模块）、基于 Ollama 的本地 AI 聊天、类 cron 调度器、执行日志和流程日历，所有功能均在本地运行，无需强制依赖云服务。

🌐 [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português](README.pt.md) · [日本語](README.ja.md)

---

## 目录

1. [功能特性](#功能特性)
2. [技术栈](#技术栈)
3. [快速开始](#快速开始)
4. [构建发布版本](#构建发布版本)
5. [应用页面](#应用页面)
6. [模块类型参考](#模块类型参考)
7. [流程调度器](#流程调度器)
8. [AI 提供商](#ai-提供商)
9. [数据存储](#数据存储)
10. [安全性](#安全性)
11. [国际化](#国际化)
12. [项目结构](#项目结构)

---

## 功能特性

- **可视化流程构建器** — 使用可复用模块构建自动化工作流的无代码画布
- **Cron 调度器** — 按固定间隔或选定星期几的特定时间调度流程；完全在后台运行
- **AI 聊天** — 使用 Ollama 在本地进行实时流式响应聊天
- **对话管理** — 创建、重命名和删除对话；通过命名文件夹整理
- **执行日志** — 每个流程的执行历史记录，包含逐步详细日志、执行时间和状态
- **自定义日志存储** — 流程将命名键值日志写入 SQLite，供后续查询或删除
- **流程日历** — 可视化已调度流程和历史执行的日/月/年日历
- **深色/浅色/系统主题** — 三种主题模式，配备 5 个强调色预设
- **7 种 UI 语言** — 西班牙语、英语、德语、法语、葡萄牙语、日语、中文

---

## 技术栈

| 层次 | 技术 |
|---|---|
| UI 框架 | Angular 19（独立组件，延迟加载路由） |
| 桌面壳 | Electron（contextBridge IPC，`contextIsolation: true`） |
| 样式 | Tailwind CSS 3，`darkMode: 'class'` |
| 数据库 | SQLite，通过 `better-sqlite3`（WAL 模式） |
| 语言 | TypeScript |
| 提示框 | `ngx-simpli-alert` |
| 字体 | Inter（`@fontsource/inter`） |

---

## 快速开始

### 前提条件

- **Node.js** ≥ 18
- **Ollama** *（可选）* — 如需使用本地 AI 模型，请从 [ollama.com](https://ollama.com) 安装

### 安装依赖

```bash
npm install
```

> `postinstall` 会自动针对已安装的 Electron 版本重新构建本地模块（`better-sqlite3`）。

### 开发模式运行

```bash
npm run electron:dev
```

同时启动三个进程：

1. `ng serve` — Angular 开发服务器，监听 `http://localhost:4200`
2. `tsc --watch` — Electron 主进程的 TypeScript 编译器
3. `electron` — 开发服务器就绪后加载 `http://localhost:4200`

---

## 构建发布版本

详情请参阅 [BUILD.md](BUILD.md)。

```bash
# Windows（NSIS 安装程序 + 便携版，x64）
npm run dist:win

# macOS（DMG + ZIP，x64 + arm64）— 必须在 macOS 上运行
npm run dist:mac

# Linux（tar.gz，x64）
npm run dist:linux
```

构建产物放置在 `release/` 目录中。

---

## 应用页面

### 仪表板

启动后的入口页面：

- **统计卡片** — 流程总数、活跃（已调度）流程、对话总数、可用 AI 模型
- **最近执行** — 最后的流程执行记录及状态（成功/错误）
- **快捷操作** — 任务构建器、聊天、日历、AI 模型的快捷方式

### 任务构建器（流程自动化）

核心功能。构建流程的**可视化画布**：

1. 从左侧栏将模块类型拖放到画布
2. 从输出连接器拖动到输入连接器来连接模块
3. 在右侧面板配置每个模块（单击选择）
4. 设置**调度**（间隔或特定时间 + 星期几）
5. 点击**运行**手动执行，或保存让调度器处理

画布功能：平移（中键拖动）、缩放（滚轮）、多选（Shift+点击）、右键上下文菜单、所有文本字段支持 `{{varName}}` 插值。

### 流程库

浏览和管理所有已保存的流程：

- 网格或列表视图，按名称搜索，排序选项
- 仅筛选已调度流程
- 重命名、复制、删除、启用/禁用流程
- 直接从库中快速运行流程

### 流程日历

调度流程和执行历史的可视化：

- **日视图** — 显示一天执行情况的按小时网格
- **月视图** — 每天带执行点的月历网格
- **年视图** — 全年活动热力图

单击任意执行记录可打开逐步详细日志。

### AI 聊天（聊天机器人）

基于 Ollama 的全功能聊天：

- Ollama 本地模型选择器
- 逐令牌流式响应
- 对话管理（创建、重命名、删除）
- 通过命名文件夹整理对话
- 首次交互后自动生成对话标题

### AI 模型

查看和管理可用的 Ollama 模型：

- 列出所有本地可用的 Ollama 模型
- 检查 Ollama 服务状态
- 无需 API 密钥 — Ollama 在 `http://localhost:11434` 自动检测

### 自定义日志

通过 **Save Log** 模块显示流程写入的日志条目的可搜索分页表格：

- 按日志名称、流程、日期范围筛选
- 带原始/表格 JSON 查看器的详情弹窗
- 删除单个条目或按筛选条件批量删除

### 设置

- **语言** — 切换 7 种语言（即时生效）
- **主题** — 浅色、深色或系统（跟随操作系统设置）
- **强调色** — 蓝色、绿色、粉色、琥珀色或紫色
- **Ollama** — 检查服务状态，启动/停止本地守护进程

---

## 模块类型参考

| 模块 | 类别 | 描述 |
|---|---|---|
| `api-rest` | 集成 | HTTP 请求（GET/POST/PUT/DELETE/PATCH）。根据响应状态路由到 `2xx`、`4xx`、`5xx` 输出端口。支持标头、请求体、`outputVar` 和数据映射。 |
| `ai-prompt` | AI | 向所选 Ollama 模型发送提示；将文本响应存储在 `outputVar` 中。 |
| `local-storage` | 数据 | 从持久化本地存储中读写命名键。 |
| `set-variable` | 变量 | 将字面值或表达式赋给命名流程变量。 |
| `save-log` | 日志 | 将命名日志条目（键 + 值）写入自定义日志表。 |
| `delete-log` | 日志 | 删除与名称筛选条件匹配的日志条目（可选择仅限当前流程）。 |
| `fork` | 控制 | 将执行拆分为多个并行分支（扇出）。 |
| `join` | 控制 | 等待所有传入分支完成后再继续（扇入）。 |

### 变量插值

所有文本字段支持 `{{varName}}` 语法。变量在运行时从当前流程上下文中解析。

### 数据映射

生成对象结果的模块（`api-rest`、`ai-prompt`）支持**数据映射**：从结果中提取嵌套属性并存储到命名变量中供后续模块使用。

---

## 流程调度器

在 **Electron 主进程**中运行，**每 30 秒**检查一次已启用流程的调度。

调度类型：

- **间隔** — 距上次执行每 N 分钟/小时/天
- **特定时间** — 在所选星期几（周一至周日）的配置 HH:MM

每次执行：

1. 依次执行流程中所有已连接的模块
2. 将完整的逐步执行日志持久化到 SQLite
3. 显示包含结果的操作系统桌面通知

防止同一流程的并发执行。

---

## AI 提供商

| 提供商 | 认证 |
|---|---|
| Ollama（本地） | 无 — 在 `http://localhost:11434` 自动检测 |

所有 AI 功能使用本地运行的 Ollama。无需云端 API 密钥，也不存储任何密钥。

---

## 数据存储

所有持久化数据存储在单个 **SQLite** 数据库中：

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| 表 | 内容 |
|---|---|
| `conversation` | 带标题和文件夹的聊天对话 |
| `message` | 单条聊天消息（角色、内容、时间戳） |
| `folder` | 对话文件夹 |
| `flow` | 已保存的自动化流程（画布 JSON、调度配置） |
| `execution_log` | 每个流程的执行历史，包含步骤日志和执行时间 |
| `custom_log` | 流程写入的命名键值日志条目 |
| `user_profile` | 用户显示名称 |

WAL 模式已启用以提升写入性能和崩溃安全性。Schema 迁移在启动时自动运行。

---

## 安全性

- **上下文隔离** — `contextIsolation: true`，`nodeIntegration: false`；渲染进程仅通过 `preload.ts` 中的 `window.agi` 桥接与主进程通信
- **路径遍历保护** — `resolveSafePath()` 验证所有文件系统操作并将其限制在配置的项目根目录内
- **命令白名单** — 终端执行限制为 `node`、`npm`、`npx ng`；任意命令会被拒绝
- **网络非公开** — 应用程序不开放服务器端口；所有 IPC 均为本地

---

## 国际化

语言文件为扁平的 JSON 键值映射：

```
src/assets/i18n/
  es.json   (西班牙语 — 默认)
  en.json   (英语)
  de.json   (德语)
  fr.json   (法语)
  pt.json   (葡萄牙语)
  ja.json   (日语)
  zh.json   (中文)
```

当前语言保存在 `localStorage` 中，无需重新加载即可在运行时更改。

---

## 项目结构

```
helper-cron-community/
├── electron/                  # Electron 主进程（TypeScript）
│   ├── main.ts                # 入口点，窗口创建，IPC 注册
│   ├── preload.ts             # contextBridge — 向渲染进程暴露 window.agi
│   ├── db/                    # SQLite 存储库（better-sqlite3）
│   ├── executor/
│   │   ├── flow.executor.ts   # 流程图遍历器和模块执行器
│   │   └── action.executor.ts # 文件系统操作执行器
│   ├── ipc/                   # IPC 处理器模块（按功能域划分）
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Cron 调度器（30 秒节拍）
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # 延迟加载页面组件
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # 共享 UI 组件
│   │   │   ├── services/      # Angular 服务
│   │   │   ├── models/        # TypeScript 接口
│   │   │   └── pipes/         # 如 TranslatePipe
│   │   └── shared/
│   └── assets/
│       └── i18n/              # 翻译 JSON 文件
├── scripts/                   # 构建辅助脚本
├── BUILD.md
└── package.json
```

---

## 运行测试

```bash
ng test
```

使用 Karma + Jasmine 在 Chrome Headless 中运行单元测试。
