# 聊天组件（ChatView / ChatInput）设计

- 作者：ChaiMingXu
- 创建时间：2026/06/29
- 适用包：`packages/air-design`
- 参考实现：`/opt/JettoAuthor/apps/web/src/pages/Chat/ChatView.tsx`、`ChatInput.tsx`

## 1. 背景与目标

在 `air-design` 组件库中新增两个通用聊天组件，用于在各类企业应用（JettoAuthor、AirMachine 等）中实现 AI 对话的**内容输入**与**内容显示**。

- `ChatInput`：聊天输入框，支持多行、自适应高度、回车发送、换行、IME 处理。
- `ChatView`：聊天消息列表，支持流式输出、自动滚动，正文用 Markdown 渲染（图片、代码、公式、Mermaid），并**针对 Claude Code 的标签体系做定制渲染**。

## 2. 关键决策

1. **Claude Code 标签处理位置**：采用 ChatView 层**内容分段器** + 专用标签渲染器；现有 `Markdown` 组件保持不动。理由：关注点分离，Markdown 仍是通用渲染器，Claude Code 逻辑内聚、可独立移除，解析器为纯函数便于验证。
2. **组件归属**：放入 `air-design` 作为库组件，并在 `example` 新增演示页（与现有 Button/Tree 等一致）。
3. **API 形态**：对齐 JettoAuthor 既有用法（`chatList` + 流式 `lastContent` + `loading` + 用量/工具元数据），便于直接迁移。
4. **样式约定**：遵循 air-design 现有"普通 CSS 文件 + 全局类名"约定（参照 `Markdown/`、`Form/`），类名前缀 `chat-`。不使用 Less CSS Modules。

## 3. 目录结构

```
packages/air-design/src/components/
  ChatView/
    index.tsx          ChatView 主体；导出 ChatViewProps / ChatMessage / ChatUsage
    claudeSegments.ts  纯函数：内容分段（Claude Code 标签解析）
    TagBlock.tsx       专用标签渲染器（系统提醒/任务通知/工具调用/工具结果）
    index.css          样式
  ChatInput/
    index.tsx          ChatInput 主体；导出 ChatInputProps
    index.css          样式
```

- 在 `packages/air-design/src/index.ts` 导出 `ChatView`、`ChatInput` 及类型。
- `example/src/pages/ChatPage.tsx` 新增演示页，并接入 `example/src/App.tsx` 的导航与路由。

## 4. ChatInput 设计

忠实移植 JettoAuthor 实现，仅将样式由 Less 改写为 `index.css`。

功能：
- `textarea` 自适应高度：基线 `minRows * 24px`，上限 `MAX_HEIGHT=180`。
- 回车发送；`Ctrl/Cmd + Enter` 插入换行；IME 合成期（`compositionStart/End`）不触发发送。
- 发送按钮：`finished` 控制"发送/停止"两态；流式中（`finished=false`）点击停止按钮触发 `onStop`；空内容或 `disabled` 时不发送；发送后清空并重置高度。
- **输入框下方工具栏**：左侧工具按钮区（首个为"附件"按钮）、右侧发送按钮（由绝对定位改为流入工具栏，布局更贴合参考图）。附件按钮点击触发隐藏的 `<input type="file">`，选中后通过 `onFileUpload` 上抛 `File[]`，由消费方自行上传/预览。
- 依赖：`Icon`（air-design 已有，含 `attachment` 图标）。`onHeightChange` 回调改为上抛 wrapper 真实高度（含工具栏）。

Props（与参考一致）：

| 属性 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `onSend` | `(value: string) => void` | 必填 | 发送回调 |
| `onStop` | `() => void` | - | 终止流式输出回调（`finished=false` 时停止按钮可点击） |
| `onHeightChange` | `(height: number) => void` | - | 高度变化回调 |
| `placeholder` | `string` | `'请输入问题...'` | 占位符 |
| `showSendButton` | `boolean` | `true` | 是否显示发送按钮 |
| `finished` | `boolean` | `true` | 是否已完成（控制按钮态） |
| `sendIcon` | `string` | `'send'` | 发送图标名 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `minRows` | `number` | `1` | 最小行数 |
| `width` | `number` | - | 输入框宽度 |
| `showAttachment` | `boolean` | `true` | 是否显示工具栏左侧的附件按钮 |
| `onFileUpload` | `(files: File[]) => void` | - | 附件选择回调，返回选中的文件列表 |
| `accept` | `string` | - | 文件选择框 accept（如 `image/*`），默认不限 |
| `multiple` | `boolean` | `true` | 是否允许多选 |

## 5. ChatView 设计

### 5.1 数据接口（对齐 JettoAuthor）

```ts
interface ChatUsage {
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  turns?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  usage?: string | ChatUsage | null;     // 本轮用量
  toolCalls?: string[];                    // 结构化工具调用（json 字符串）
  toolResults?: string[];                  // 结构化工具结果（文本）
}

interface ChatViewProps {
  height: number;
  width: number;
  innerWidth?: number;
  chatList: ChatMessage[];
  lastContent: string;                     // 流式正文
  loading: boolean;
  lastUsage?: string | null;
  lastToolCalls?: string[];
  lastToolResults?: string[];
  assistantName?: string;                  // 默认 'MACHINE'
  contentPadding?: number;
  waitingWithSpin?: boolean;
}
```

### 5.2 渲染流程（核心改动）

对每条 assistant 消息：
1. 调用 `segmentClaudeContent(content, { streaming })` 将正文切成有序片段。
2. 依次渲染：
   - `markdown` 片段 → `<Markdown>`（已处理 `<think>`/公式/代码/图片/mermaid）；
   - `system-reminder` / `task-notification` / `tool-use` / `tool-result` 片段 → `<TagBlock>`。
3. 结构化 props（`toolCalls`/`toolResults`）已 `@deprecated`，不再单独渲染；工具调用/结果统一以正文内联标签 `<tool_use>`/`<tool_result>` 承载，由分段器按出现顺序展示（不再统一置底）。

其余逻辑沿用参考：自动滚动到底、整条/代码块复制、用量行、`React.memo` 浅比较、头像图标（用户 `talker` / 助手 `flash`）。

## 6. Claude Code 标签规格

### 6.1 分段器 `segmentClaudeContent`

纯函数，输入正文与 `{ streaming }`，输出有序片段数组：

```ts
type ClaudeSegment =
  | { type: 'markdown'; content: string }
  | { type: 'system-reminder'; content: string }
  | { type: 'task-notification'; content: string; attrs?: Record<string, string> }
  | { type: 'tool-use'; name?: string; raw: string }
  | { type: 'tool-result'; raw: string };
```

解析的标签：

| 标签 | 片段类型 | 渲染 |
|---|---|---|
| `<system-reminder>…</system-reminder>` | `system-reminder` | 折叠"系统提醒"块，默认收起，灰色小字 |
| `<task-notification …>…</task-notification>` | `task-notification` | 任务通知块，带状态标识；支持可选属性 |
| `<tool_use name="Bash">{json}</tool_use>` | `tool-use` | Claude Code 风格工具调用块：工具图标 + 名称 + 参数（等宽、可折叠） |
| `<tool_result>…</tool_result>` | `tool-result` | 工具结果块（可折叠、等宽、限高滚动） |

不在分段器处理、保留在 `markdown` 片段交由 Markdown 的标签：`<think>`、`<antThinking>`（Markdown 已内置折叠思考块）。

### 6.2 工具块来源

- 工具调用/结果统一以**正文内联标签** `<tool_use>` / `<tool_result>` 承载，由分段器按出现顺序渲染（不再统一置底）。
- 结构化 props `toolCalls` / `toolResults` 已 `@deprecated`，不再单独渲染（保留字段以兼容旧数据传入，但不会展示）。后端如需展示工具信息，应将其作为内联标签写入 `content`。
- json 字段兼容：工具名取 `name` / `tool_name` / `function.name`；参数取 `arguments` / `args` / `parameters`。

### 6.3 流式容错

- `streaming=true` 时，未闭合的开始标签视为普通文本，待闭合后再分段（与 Markdown 围栏修复同思路），避免解析抖动。
- 标签不做嵌套假设，采用非贪婪匹配。

## 7. 错误处理与边界

- 正文为空或解析失败：回退为单条 `markdown` 片段，保证始终可渲染。
- 工具 json 解析失败：原样以文本展示（沿用参考 `safeJsonParse`）。
- 系统提醒 / 工具结果过长：限高 + 内部滚动。
- 流式未闭合标签：按 6.3 处理。

## 8. 文档同步

- 更新 `docs/architecture.md` 与 `packages/air-design/README.md`：补充 ChatView / ChatInput 与 Claude Code 标签规格说明。
- 遵循 CLAUDE.md：不创建描述修复过程的 Markdown 文件。

## 9. 验收标准

- `ChatInput` 行为与 JettoAuthor 一致：自适应高度、回车发送、Ctrl/Cmd+Enter 换行、IME 不误触发、发送/停止态切换。
- `ChatView` 正确渲染 user/assistant 消息、流式输出、自动滚动、复制。
- Markdown 正文正确渲染图片、代码高亮、公式、Mermaid、`<think>`。
- Claude Code 标签按规格渲染：系统提醒/任务通知折叠块、工具调用/结果块（内联与结构化两种来源）。
- 流式过程中未闭合标签不破坏渲染。
- `example` 演示页可独立运行展示上述能力。
- 通过 `npm run build -w air-design` 构建。

## 10. 消息渲染重构（2026/06/30）

### 10.1 背景与问题

ChatView 同时承载来自大模型与 Claude Code 智能体的消息。原实现存在两点不足：

1. thinking 处理不统一且不完整：`<think>` 由 Markdown 内部 `ThinkBlock` 渲染，但 Claude Code 智能体的 `<antThinking>` 标签未被识别（分段器注释声称支持，实际 Markdown 正则仅覆盖 `think`/`redacted_reasoning`），导致智能体思考内容无法以独立样式呈现。
2. 工具调用割裂：`<tool_use>` 与 `<tool_result>` 渲染为两个独立折叠块，调用输入与执行结果分离，阅读体验差。

### 10.2 设计决策

1. **统一渲染管线，不区分消息来源**：模型消息仅是"不含工具标签"的特例，复用同一条流水线，无需为 `ChatMessage` 增加来源字段（保持 API 兼容）。
2. **thinking 抽离为独立片段**：在分段器层面识别所有思考标签变体，从 markdown 段剥离，交由专用 `ThinkingBlock` 渲染（统一视觉、修复 `antThinking` 不显示）。
3. **工具调用顺序配对合并**：`<tool_use>` 与其后出现的 `<tool_result>` 合并为同一折叠块 `ToolCallBlock`；按出现顺序配对，中间穿插的文本不打断配对（`tool_result` 不带 id 只能顺序配对）。

### 10.3 渲染管线

```
content
  → segmentClaudeContent()   切原子片段（新增 thinking 片段）
  → pairToolCalls()          按出现顺序合并 tool-use 与 tool-result 为 tool-call
  → renderSegment()          逐段渲染
```

### 10.4 分段器改动（claudeSegments.ts）

- 新增原子片段类型 `thinking`：`{ type: 'thinking'; content: string }`。
- 识别标签：`<think>`、`<antThinking>`、`<thinking>`、`<redacted_reasoning>`（含带属性变体）。
- 按"长前缀优先 + close 标签校验兜底"解决 `<think>` / `<thinking>` 前缀冲突；流式中 thinking 开始标签未闭合时，把已到达内容作为 thinking 片段（避免 `<antThinking>` 等被当作未知 HTML 标签交给 Markdown 产生 console 警告），其它标签未闭合仍当普通文本。
- 新增导出 `pairToolCalls(segs): RenderSegment[]`（纯函数）。新增 `RenderSegment` 类型，含复合片段 `tool-call`：`{ type: 'tool-call'; name?: string; input?: string; output?: string }`。

### 10.5 配对规则（pairToolCalls）

按出现顺序配对（`tool_result` 不带 id 只能顺序配对），跨中间文本不打断配对：

- 维护待配对 `tool-use`（pendingUse）；遇到 `tool-result` 则与之合并为 `tool-call { input, output }`。
- 连续多个 `tool-use`：前一个尚未配上结果时先单独输出 `tool-call { input }`。
- 落单 `tool-result`（前面无 use）→ `tool-call { output }`。
- `tool-use` 与 `tool-result` 之间的 markdown/其它片段原样原位输出（不打断配对）。
- 末尾仍有未配对 `tool-use`（流式中结果尚未到达）→ `tool-call { input }`。

### 10.6 标签块改动（TagBlock.tsx）

- 新增 `ThinkingBlock`：折叠块，默认收起，标题"思考过程"，`insight` 图标，新色调 `thinking`（琥珀金 `#d5924a`，区别于 info 蓝 / tool 蓝紫 / success 绿）；内容用 `<Markdown>` 渲染。
- 新增 `ToolCallBlock`：折叠块，`tone=tool`，标题=工具名（无则"工具调用"），工具图标；展开后分"输入参数""输出结果"两小节；只输入无输出时标题加"运行中" badge。
- `ToolUseBlock` / `ToolResultBlock` 标记 `@deprecated`（JSDoc），不再被 ChatView 使用；二者未对外导出，不影响外部。

### 10.7 主体改动（index.tsx）

- `renderContent`：`segmentClaudeContent` → `pairToolCalls` → `map(renderSegment)`。
- `renderSegment`：新增 `thinking` → `<ThinkingBlock>`、`tool-call` → `<ToolCallBlock>`；移除 `tool-use` / `tool-result` 两个旧分支。

### 10.8 样式改动（index.css）

新增 `.chat-tag-thinking`（琥珀左边框 `#d5924a`）、`.chat-tool-section` / `.chat-tool-section-title`（输入/输出小节）、`.chat-tool-badge-running`（运行中徽标）。

### 10.9 范围与兼容

- 不改 `ChatInput`、不改 `Markdown` 通用逻辑、不动主应用调用方；`ChatMessage` 无字段变更，API 兼容。
- 同步更新 `docs/architecture.md` 标签规格段。

### 10.10 验收标准

- 模型消息的 `<think>` 以独立折叠块（`ThinkingBlock`）显示。
- 智能体消息的 `<antThinking>` 正确识别并独立显示（修复原 bug）。
- 工具调用输入与输出合并为同一折叠块，展开后分两小节；落单的单独成块。
- thinking 默认收起、琥珀色调；工具块蓝紫色调保持。
- 中间穿插的 markdown 正文原位渲染不受影响。
- 流式中 `tool_use` 已出但 `tool_result` 未到时单独显示，结果到达后自动合并。
- 通过 `npm run build -w air-design` 构建。
